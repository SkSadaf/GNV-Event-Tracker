package scraper

import (
	"encoding/json"
	"fmt"
	"log"
	"net/url"
	"regexp"
	"strconv"
	"strings"

	"backend/data"
	"backend/database"

	"golang.org/x/text/cases"
	"golang.org/x/text/language"

	"github.com/gocolly/colly"
	"github.com/muesli/gominatim"
	"github.com/texttheater/golang-levenshtein/levenshtein"
)

type Event struct {
	Link string `json:"link"`
}

func CleanWhiteSpaces(str string) string {
	// Preserve trailing newline
	hasTrailingNewline := strings.HasSuffix(str, "\n")

	// Trim leading spaces
	str = strings.TrimLeft(str, " \t\n") // Remove leading spaces, tabs, and newlines

	// Temporarily remove trailing newlines before processing
	str = strings.TrimRight(str, "\n")

	// Replace all newlines with spaces (except the trailing one)
	str = strings.ReplaceAll(str, "\n", " ")

	// Remove all extra spaces and tabs
	re := regexp.MustCompile(`\s+`)
	str = re.ReplaceAllString(str, " ")

	// Restore the trailing newline if it was there
	if hasTrailingNewline {
		str += "\n"
	}

	return str
}

func RemoveWhiteSpaces(str string) string {
	// This function removes all whitespace characters from the string
	// including spaces, tabs, and newlines.

	// Use a regular expression to replace all whitespace characters with an empty string
	re := regexp.MustCompile(`\s+`)
	str = re.ReplaceAllString(str, "")

	return str
}

func CheckForDuplicateEvents(eventTitle string, eventDate string, eventLocation string) bool {

	var events []data.Event

	// Pre-filter by event date and city before checking duplicates
	query := database.DB.Where("name LIKE ?", eventTitle).
		Where("date LIKE ?", eventDate).
		Where("location LIKE ?", eventLocation).
		Limit(10) // Avoid fetching too many events

	if err := query.Find(&events).Error; err != nil {
		log.Println("Error fetching events from database:", err)
		return false
	}

	// Levenshtein distance for similarity check
	threshold := 3 // Tune this threshold based on real-world testing

	for _, event := range events {

		if event.Name == eventTitle {
			log.Println("DUPLICATE FOUND: EVENT NOT INSERTED - Title:", eventTitle)
			return true
		}

		distance := levenshtein.DistanceForStrings([]rune(strings.ToLower(eventTitle)), []rune(strings.ToLower(eventTitle)), levenshtein.DefaultOptions)

		if distance <= threshold {
			log.Println("DUPLICATE FOUND: EVENT NOT INSERTED - Title:", eventTitle)
			return true
		}
	}

	return false
}

func InsertEventIntoDB(name, date, location, googleMapsLink, description string, category string, organizerName string, organizerEmail string, organizerTel string, tags string, imageURL string, websiteURL string, ticketsURL string) error {
	// Check if the event already exists in the database
	var existingEvent data.Event
	if err := database.DB.Where("name = ? AND date = ? AND location = ?", name, date, location).First(&existingEvent).Error; err == nil {
		// Event already exists, return without inserting
		return nil
	}

	// Check if organizerName is not null or empty
	var organizerID uint
	if organizerName != "" {
		// Attempt to find the organizer by name directly in the database
		var organizer data.Organizer
		err := database.DB.Where("name = ? AND email = ?", organizerName, organizerEmail).First(&organizer).Error
		if err == nil {
			// Organizer found, set organizerID
			organizerID = organizer.ID
		} else {
			// Organizer not found, create a new organizer
			newOrganizer := data.Organizer{
				Name:           organizerName,
				Email:          organizerEmail,
				ContactDetails: organizerTel,
			}
			if err := database.DB.Create(&newOrganizer).Error; err != nil {
				return fmt.Errorf("failed to create new organizer: %v", err)
			}
			organizerID = newOrganizer.ID
		}
	} else {
		// Log a warning if organizerName is empty
		log.Println("Warning: Organizer name is empty. Organizer ID will not be set.")
	}

	// Insert the event into the database
	event := data.Event{
		Name:           name,
		Date:           date,
		Location:       location,
		Description:    description,
		GoogleMapsLink: googleMapsLink,
		Category:       category,
		Tags:           tags,
		ImageURL:       imageURL,
		Website:        websiteURL,
		TicketsURL:     ticketsURL,
	}

	if organizerID != 0 {
		event.OrganizerID = organizerID

		// Set the actual organizer object field for the event
		var organizer data.Organizer
		if err := database.DB.First(&organizer, organizerID).Error; err == nil {
			event.Organizer = organizer
		} else {
			log.Println("Error fetching organizer:", err)
		}
	}

	if err := database.DB.Create(&event).Error; err != nil {
		return err
	}

	// Populate latitude and longitude for the inserted event
	if err := PopulateLatLng(&event); err != nil {
		log.Println("Error populating latitude/longitude:", err)
	}

	return nil
}

// removeNameFromLocation removes the name part from the location string and returns the address part
func removeNameFromLocation(location string) string {
	// Split the location string by spaces to find where the numeric address starts
	parts := strings.Fields(location)
	for i, part := range parts {
		// Check if the part is numeric
		if _, err := strconv.Atoi(part); err == nil {
			// Return the location starting from the numeric address
			return strings.Join(parts[i:], " ")
		}
	}
	return "" // Return an empty string if no numeric address is found
}

// PopulateLatLng updates the latitude and longitude for events in the database
func PopulateLatLng(event *data.Event) error {
	// Set Gominatim server
	gominatim.SetServer("https://nominatim.openstreetmap.org/")

	originalLocation := event.Location
	query := gominatim.SearchQuery{Q: originalLocation}

	// Helper function to get lat/lng from query
	getLatLng := func(query gominatim.SearchQuery) (*gominatim.SearchResult, error) {
		results, err := query.Get()
		if err != nil || len(results) == 0 {
			return nil, err
		}
		return &results[0], nil
	}

	// Determine the first character of location
	firstChar := strings.TrimSpace(originalLocation)
	if firstChar == "" {
		return fmt.Errorf("location string is empty")
	}
	firstRune := []rune(firstChar)[0]

	var result *gominatim.SearchResult
	var err error

	// Case 1: Starts with a letter
	if (firstRune >= 'A' && firstRune <= 'Z') || (firstRune >= 'a' && firstRune <= 'z') {
		result, err = getLatLng(query)

		// If no result, try removing name part (fall back to numeric section)
		if err != nil || result == nil {
			modified := removeNameFromLocation(originalLocation)
			if modified != "" {
				query = gominatim.SearchQuery{Q: modified}
				result, err = getLatLng(query)
			}
		}
	} else {
		// Case 2: Starts with number
		result, err = getLatLng(query)

		// If no result, try truncating at "United States" or equivalent
		if err != nil || result == nil {
			truncated := truncateAtCountry(originalLocation)
			if truncated != "" {
				query = gominatim.SearchQuery{Q: truncated}
				result, err = getLatLng(query)
			}
		}
	}

	if err != nil || result == nil {
		log.Printf("No geocoding results found for event ID %d, location: %s\n", event.ID, originalLocation)
		return fmt.Errorf("no geocoding results found for location: %s", originalLocation)
	}

	// Convert strings to floats
	lat, err := strconv.ParseFloat(result.Lat, 64)
	if err != nil {
		return fmt.Errorf("error parsing latitude: %v", err)
	}
	lng, err := strconv.ParseFloat(result.Lon, 64)
	if err != nil {
		return fmt.Errorf("error parsing longitude: %v", err)
	}

	// Update event with lat/lng
	event.Latitude = lat
	event.Longitude = lng

	if err := database.DB.Save(event).Error; err != nil {
		log.Printf("Failed to update event ID %d: %v\n", event.ID, err)
		return err
	}
	fmt.Printf("Updated event ID %d with lat/lng: (%f, %f)\n", event.ID, lat, lng)

	return nil
}

func truncateAtCountry(location string) string {
	countries := []string{"United States", "USA", "US", "Canada", "UK", "United Kingdom"}
	for _, country := range countries {
		if idx := strings.Index(location, country); idx != -1 {
			return strings.TrimSpace(location[:idx])
		}
	}
	return ""
}

func ScrapeVisitGainesville() {
	baseURL := "https://www.visitgainesville.com/wp-json/wp/v2/tribe_events?order=asc&page=%d&per_page=12&orderby=date"
	organizerAPI1 := "https://www.visitgainesville.com/wp-json/wp/v2/tribe_organizer?order=asc&page=1&per_page=100&orderby=date"
	organizerAPI2 := "https://www.visitgainesville.com/wp-json/wp/v2/tribe_organizer?order=asc&page=2&per_page=100&orderby=date"
	page := 1
	const maxPages = 5

	// Create a collector for the main API requests
	apiCollector := colly.NewCollector(
		colly.AllowedDomains("www.visitgainesville.com", "visitgainesville.com"),
		colly.UserAgent("Mozilla/5.0"),
	)

	// Create a separate collector for visiting individual event pages
	eventPageCollector := colly.NewCollector(
		colly.AllowedDomains("www.visitgainesville.com", "visitgainesville.com"),
		colly.UserAgent("Mozilla/5.0"),
	)

	// Create a collector for the organizer API
	organizerCollector := colly.NewCollector(
		colly.AllowedDomains("www.visitgainesville.com", "visitgainesville.com"),
		colly.UserAgent("Mozilla/5.0"),
	)

	// Map to store event details while waiting for address scraping
	eventDetails := make(map[string]struct {
		Name        string
		Description string
		StartDate   string
		EndDate     string
		Cost        string
		ImageURL    string
		URL         string
		Category    string
		Tags        string
		Organizer   string
	})

	// Map to cache organizer data
	organizerCache := make(map[string]string)

	// Handle individual event pages to scrape address and Google Maps link
	eventPageCollector.OnHTML("body", func(e *colly.HTMLElement) {
		eventURL := e.Request.URL.String()
		address := e.DOM.Find(".tribe-events-venue-details .tribe-venue").Text()
		cleanedAddress := CleanWhiteSpaces(address)

		escapedAddress := url.QueryEscape(cleanedAddress)
		googleMapsLink := "https://www.google.com/maps?q=" + escapedAddress

		// Retrieve the event details from the map
		if details, found := eventDetails[eventURL]; found {
			eventDate := fmt.Sprintf("%s - %s", details.StartDate, details.EndDate)

			// Check for duplicates before inserting into the database
			if !CheckForDuplicateEvents(details.Name, eventDate, cleanedAddress) {
				err := InsertEventIntoDB(details.Name, eventDate, cleanedAddress, googleMapsLink, details.Description, details.Category, details.Organizer, "example@ex.com", "0000000000", details.Tags, details.ImageURL, details.URL, "")
				if err != nil {
					log.Println("Error inserting event into database:", err, "Event:", details.Name)
				}

				fmt.Printf("Event: %s\nDate: %s\nLocation: %s\nDescription: %s\nCost: %s\nURL: %s\nImage: %s\nGoogle Maps Link: %s\nOrganizer: %s\n\n",
					details.Name, eventDate, cleanedAddress, details.Description, details.Cost, details.URL, details.ImageURL, googleMapsLink, details.Organizer)
			}
		}
	})

	// Handle API responses to get event data
	apiCollector.OnResponse(func(r *colly.Response) {
		var events []struct {
			Title struct {
				Rendered string `json:"rendered"`
			} `json:"title"`
			Content struct {
				Rendered string `json:"rendered"`
			} `json:"content"`
			MetaFields struct {
				EventStartDate   string `json:"_EventStartDate"`
				EventEndDate     string `json:"_EventEndDate"`
				EventCost        string `json:"_EventCost"`
				EventOrganizerID string `json:"_EventOrganizerID,omitempty"`
			} `json:"meta_fields"`
			Link      string   `json:"link"`
			ThumbURL  string   `json:"thumb_url"`
			ClassList []string `json:"class_list"`
		}

		if err := json.Unmarshal(r.Body, &events); err != nil {
			log.Println("JSON parse error:", err)
			return
		}

		// Process each event
		for _, event := range events {
			cleanedEventName := CleanWhiteSpaces(event.Title.Rendered)
			cleanedEventDescription := CleanWhiteSpaces(event.Content.Rendered)
			cleanedEventStartDate := CleanWhiteSpaces(event.MetaFields.EventStartDate)
			cleanedEventEndDate := CleanWhiteSpaces(event.MetaFields.EventEndDate)
			cleanedEventCost := CleanWhiteSpaces(event.MetaFields.EventCost)
			cleanedImageURL := CleanWhiteSpaces(event.ThumbURL)
			eventURL := CleanWhiteSpaces(event.Link)
			eventOrganizerID := CleanWhiteSpaces(event.MetaFields.EventOrganizerID)

			// Parse class_list for categories and tags
			var categories, tags []string
			for _, class := range event.ClassList {
				if strings.HasPrefix(class, "cat_") {
					category := strings.ReplaceAll(class[4:], "-", " ")
					if category != "gainesville" && category != "downtown gainesville" && category != "whats good" {
						categories = append(categories, cases.Title(language.English).String(category))
					}
				}
				if strings.HasPrefix(class, "tag-") {
					tag := strings.ReplaceAll(class[4:], "-", " ")
					tags = append(tags, cases.Title(language.English).String(tag))
				}
			}
			categoryString := strings.Join(categories, ", ")
			tagString := strings.Join(tags, ", ")

			// Fetch organizer data
			var organizerName string
			if cachedName, found := organizerCache[eventOrganizerID]; found {
				organizerName = cachedName
			} else {
				organizerCollector.OnResponse(func(r *colly.Response) {
					var organizers []struct {
						ID    string `json:"id"`
						Title struct {
							Rendered string `json:"rendered"`
						} `json:"title"`
					}

					if err := json.Unmarshal(r.Body, &organizers); err != nil {
						log.Println("JSON parse error in organizer API:", err)
						return
					}

					for _, organizer := range organizers {
						if organizer.ID == eventOrganizerID {
							organizerName = CleanWhiteSpaces(organizer.Title.Rendered)
							organizerCache[eventOrganizerID] = organizerName
							break
						}
					}
				})

				// Visit the organizer API
				organizerCollector.Visit(organizerAPI1)
				organizerCollector.Visit(organizerAPI2)
			}

			// Store event details in the map
			eventDetails[eventURL] = struct {
				Name        string
				Description string
				StartDate   string
				EndDate     string
				Cost        string
				ImageURL    string
				URL         string
				Category    string
				Tags        string
				Organizer   string
			}{
				Name:        cleanedEventName,
				Description: cleanedEventDescription,
				StartDate:   cleanedEventStartDate,
				EndDate:     cleanedEventEndDate,
				Cost:        cleanedEventCost,
				ImageURL:    cleanedImageURL,
				URL:         eventURL,
				Category:    categoryString,
				Tags:        tagString,
				Organizer:   organizerName,
			}

			// Visit the event page to scrape the address and Google Maps link
			eventPageCollector.Visit(eventURL)
		}

		// Continue to the next page
		if len(events) > 0 && page < maxPages {
			page++
			apiURL := fmt.Sprintf(baseURL, page)
			fmt.Println("Fetching next page:", apiURL)
			apiCollector.Visit(apiURL)
		} else {
			fmt.Println("No more events or reached max pages. Stopping.")
		}
	})

	// Start scraping from page 1
	apiURL := fmt.Sprintf(baseURL, page)
	fmt.Println("Fetching:", apiURL)
	apiCollector.Visit(apiURL)
}

func ScrapeGainesvilleSun() {
	baseURL := "https://discovery.evvnt.com/api/publisher/458/home_page_events?hitsPerPage=30&page=%d&publisher_id=458"
	var page int = 0
	const maxPages int = 5

	// Create a single collector for API requests
	collector := colly.NewCollector(
		colly.AllowedDomains("discovery.evvnt.com"),
		colly.UserAgent("Mozilla/5.0"),
	)

	collector.OnResponse(func(r *colly.Response) {
		var events struct {
			RawEvents []struct {
				Title       string `json:"title"`
				StartDate   string `json:"start_date"`
				Description string `json:"description"`
				Keywords    string `json:"keywords"`
				Category    string `json:"category_name"`
				Organizer   string `json:"organiser_name"`
				Venue       struct {
					Name      string  `json:"name"`
					Address1  string  `json:"address_1"`
					Address2  string  `json:"address_2"`
					Town      string  `json:"town"`
					Country   string  `json:"country"`
					PostCode  string  `json:"post_code"`
					Latitude  float64 `json:"latitude"`
					Longitude float64 `json:"longitude"`
				} `json:"venue"`
				Links struct {
					Tickets string `json:"Tickets,omitempty"`
					Website string `json:"Website,omitempty"`
				} `json:"links"`
				Images  json.RawMessage `json:"images"`
				Contact struct {
					Email string `json:"email,omitempty"`
					Tel   string `json:"tel,omitempty"`
				} `json:"contact,omitempty"`
			} `json:"rawEvents"`
		}

		if err := json.Unmarshal(r.Body, &events); err != nil {
			log.Println("JSON parse error:", err)
			return
		}

		// Process each event
		for _, event := range events.RawEvents {
			cleanedEventName := CleanWhiteSpaces(event.Title)
			cleanedEventDate := CleanWhiteSpaces(event.StartDate)
			eventLocation := fmt.Sprintf("%s %s %s %s %s",
				event.Venue.Address1,
				event.Venue.Address2,
				event.Venue.Town,
				event.Venue.Country,
				event.Venue.PostCode,
			)
			cleanedEventLocation := CleanWhiteSpaces(eventLocation)
			cleanedEventDescription := CleanWhiteSpaces(event.Description)
			cleanedEventTags := RemoveWhiteSpaces(event.Keywords)
			cleanedOrganizerName := CleanWhiteSpaces(event.Organizer)
			cleanedOrganizerEmail := CleanWhiteSpaces(event.Contact.Email)
			cleanedOrganizerTel := CleanWhiteSpaces(event.Contact.Tel)
			category := event.Category

			escapedAddress := url.QueryEscape(cleanedEventLocation)
			mapsQuery := fmt.Sprintf("address=%s", escapedAddress)
			googleMapsLink := "https://www.google.com/maps?q=" + mapsQuery
			websiteURL := event.Links.Website
			ticketsURL := event.Links.Tickets

			// Handle the `images` field dynamically
			var cleanedImageURL string
			var singleImage struct {
				Original struct {
					URL string `json:"url"`
				} `json:"original"`
			}
			var multipleImages []struct {
				Original struct {
					URL string `json:"url"`
				} `json:"original"`
			}

			if err := json.Unmarshal(event.Images, &singleImage); err == nil {
				// Handle the case where `images` is a single object
				cleanedImageURL = singleImage.Original.URL
			} else if err := json.Unmarshal(event.Images, &multipleImages); err == nil {
				// Handle the case where `images` is an array
				if len(multipleImages) > 0 {
					cleanedImageURL = multipleImages[0].Original.URL
				}
			} else {
				// Log an error if neither case works
				log.Println("Error parsing images field:", err)
			}
			// Check for duplicates before inserting into the database
			if !CheckForDuplicateEvents(cleanedEventName, cleanedEventDate, cleanedEventLocation) {
				err := InsertEventIntoDB(cleanedEventName, cleanedEventDate, cleanedEventLocation, googleMapsLink, cleanedEventDescription, category, cleanedOrganizerName, cleanedOrganizerEmail, cleanedOrganizerTel, cleanedEventTags, cleanedImageURL, websiteURL, ticketsURL)
				if err != nil {
					log.Println("Error inserting event into database:", err, "Event:", cleanedEventName)
				}

				fmt.Printf("Event: %s\nDate: %s\nLocation: %s\nDescription: %s\nGoogle Maps Link: %s\n\n",
					cleanedEventName, cleanedEventDate, cleanedEventLocation, cleanedEventDescription, googleMapsLink)
			}
		}

		// Continue to the next page
		if len(events.RawEvents) > 0 && page < maxPages {
			page++
			apiURL := fmt.Sprintf(baseURL, page)
			fmt.Println("Fetching next page:", apiURL)
			collector.Visit(apiURL)
		} else {
			fmt.Println("No more events or reached max pages. Stopping.")
		}
	})

	// Start scraping from page 0
	apiURL := fmt.Sprintf(baseURL, page)
	fmt.Println("Fetching:", apiURL)
	collector.Visit(apiURL)
}

// The following code is commented out as the EventBrite API deprecated its search by location functionality.

// const eventBriteToken = ""

// type EventbriteResponse struct {
// 	Events []struct {
// 		Name struct {
// 			Text string `json:"text"`
// 		} `json:"name"`
// 		Start struct {
// 			Local string `json:"local"`
// 		} `json:"start"`
// 		Venue struct {
// 			Address struct {
// 				Address1   string `json:"address_1"`
// 				City       string `json:"city"`
// 				Region     string `json:"region"`
// 				PostalCode string `json:"postal_code"`
// 			} `json:"address"`
// 		} `json:"venue"`
// 		URL         string `json:"url"`
// 		Description struct {
// 			Text string `json:"text"`
// 		} `json:"description"`
// 	} `json:"events"`
// }

// func ScrapeEventBrite() {
// 	apiURL := "https://www.eventbriteapi.com/v3/events/search/?location.latitude=39.7496&location.longitude=-105.0238&location.within=50mi"
// 	req, _ := http.NewRequest(http.MethodGet, apiURL, nil)
// 	req.Header.Set("Authorization", "Bearer "+eventBriteToken)

// 	client := &http.Client{}
// 	resp, err := client.Do(req)
// 	if err != nil {
// 		fmt.Println("Error:", err)
// 		return
// 	}
// 	defer resp.Body.Close()

// 	if resp.StatusCode != 200 {
// 		errorBody, _ := io.ReadAll(resp.Body)
// 		fmt.Printf("Error: %s\nResponse Body: %s\n", resp.Status, string(errorBody))
// 		return
// 	}

// 	body, err := io.ReadAll(resp.Body)
// 	if err != nil {
// 		fmt.Println("Error reading response body:", err)
// 		return
// 	}
// 	fmt.Println("Response Body:", string(body))

// 	var result EventbriteResponse
// 	if err := json.Unmarshal(body, &result); err != nil {
// 		fmt.Println("Error decoding JSON response:", err)
// 		return
// 	}

// 	for _, event := range result.Events {
// 		// Clean text and handle missing fields
// 		cleanedEventName := CleanWhiteSpaces(event.Name.Text)
// 		cleanedEventDate := CleanWhiteSpaces(event.Start.Local)

// 		// Handle missing location gracefully
// 		locationParts := []string{}
// 		if event.Venue.Address.Address1 != "" {
// 			locationParts = append(locationParts, event.Venue.Address.Address1)
// 		}
// 		if event.Venue.Address.City != "" {
// 			locationParts = append(locationParts, event.Venue.Address.City)
// 		}
// 		if event.Venue.Address.Region != "" {
// 			locationParts = append(locationParts, event.Venue.Address.Region)
// 		}
// 		cleanedEventLocation := strings.Join(locationParts, ", ")

// 		// Handle missing description
// 		cleanedEventDescription := CleanWhiteSpaces(event.Description.Text)

// 		// Generate Google Maps link
// 		googleMapsLink := "https://www.google.com/maps?q=" + url.QueryEscape(cleanedEventLocation)

// 		// Insert event into database
// 		err := InsertEventIntoDB(cleanedEventName, cleanedEventDate, cleanedEventLocation, googleMapsLink, cleanedEventDescription)
// 		if err != nil {
// 			log.Println("Error inserting event into database:", err)
// 		}

// 		// Print event details
// 		fmt.Printf("Event: %s\nDate: %s\nLocation: %s\nDescription: %s\nGoogle Maps Link: %s\n\n",
// 			cleanedEventName, cleanedEventDate, cleanedEventLocation, cleanedEventDescription, googleMapsLink)
// 	}
// }
