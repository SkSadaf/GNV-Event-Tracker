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

func InsertEventIntoDB(name, date, location, googleMapsLink, description string, category string, organizerName string, tags string, imageURL string, websiteURL string, ticketsURL string) error {
	// Check if the event already exists in the database
	var existingEvent data.Event
	if err := database.DB.Where("name = ? AND date = ? AND location = ?", name, date, location).First(&existingEvent).Error; err == nil {
		// Event already exists, return without inserting
		return nil
	}

	// Check if organizerName is not null or empty
	var organizerID uint = 0
	if organizerName != "" {
		// Attempt to find the organizer by name directly in the database
		var organizer data.Organizer
		err := database.DB.Where("name = ?", organizerName).First(&organizer).Error
		if err == nil {
			// Organizer found, set organizerID
			organizerID = organizer.ID
		} else {
			// Organizer not found, create a new organizer
			newOrganizer := data.Organizer{
				Name: organizerName,
			}
			if err := database.DB.Create(&newOrganizer).Error; err != nil {
				return fmt.Errorf("failed to create new organizer: %v", err)
			}
			organizerID = newOrganizer.ID
		}
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

	qry := gominatim.SearchQuery{
		Q: event.Location,
	}

	// Perform the geocoding
	resp, err := qry.Get()
	if err != nil {
		log.Printf("Failed to geocode location for event ID %d: %v\n", event.ID, err)

		// Attempt to remove the name and geocode again
		modifiedLocation := removeNameFromLocation(event.Location)
		if modifiedLocation != "" {
			qry = gominatim.SearchQuery{Q: modifiedLocation}
			resp, err = qry.Get()
			if err != nil {
				log.Printf("Failed to geocode modified location for event ID %d: %v\n", event.ID, err)
				return err
			}
		} else {
			return err
		}
	}

	// Update latitude and longitude if results are found
	if len(resp) > 0 {
		lat, err := strconv.ParseFloat(resp[0].Lat, 64)
		if err != nil {
			log.Printf("Error converting latitude for event ID %d: %v\n", event.ID, err)
			return err
		}

		lng, err := strconv.ParseFloat(resp[0].Lon, 64)
		if err != nil {
			log.Printf("Error converting longitude for event ID %d: %v\n", event.ID, err)
			return err
		}

		event.Latitude = lat
		event.Longitude = lng

		if err := database.DB.Save(event).Error; err != nil {
			log.Printf("Failed to update event ID %d: %v\n", event.ID, err)
			return err
		} else {
			fmt.Printf("Updated event ID %d: (%f, %f)\n", event.ID, event.Latitude, event.Longitude)
		}
	} else {
		log.Printf("No geocoding results found for event ID %d\n", event.ID)
		return fmt.Errorf("no geocoding results found")
	}

	return nil
}

func ScrapeVisitGainesville() {

	baseURL := "https://www.visitgainesville.com/wp-json/wp/v2/tribe_events?order=asc&page=%d&per_page=12&orderby=date"
	page := 1
	maxPages := 2

	// Colly collector for scraping event pages
	eventCollector := colly.NewCollector(
		colly.AllowedDomains("www.visitgainesville.com", "visitgainesville.com"),
		colly.UserAgent("Mozilla/5.0"),
	)

	// Extract event details from individual event pages
	eventCollector.OnHTML("body", func(e *colly.HTMLElement) {
		eventName := e.ChildText("h1.event-title-text")
		cleanedEventName := CleanWhiteSpaces(eventName)

		eventDate := e.ChildText("li.event-date-time")
		cleanedEventDate := CleanWhiteSpaces(eventDate)

		eventLocation := e.ChildText("div.address")
		cleanedEventLocation := CleanWhiteSpaces(eventLocation)

		googleMapsLink := e.ChildAttr("div.directionsRow.row--format a", "href")

		eventDescription := e.ChildText("div.section-content")
		e.ForEach("span[data-olk-copy-source='MessageBody']", func(_ int, span *colly.HTMLElement) {
			eventDescription = strings.Replace(eventDescription, span.Text, "", -1)
		})
		cleanedEventDescription := CleanWhiteSpaces(eventDescription)

		// Check for duplicates before inserting into the database
		if !CheckForDuplicateEvents(cleanedEventName, cleanedEventDate, cleanedEventLocation) {
			err := InsertEventIntoDB(cleanedEventName, cleanedEventDate, cleanedEventLocation, googleMapsLink, cleanedEventDescription, "FIXME", "FIXME", "FIXME", "FIXME", "FIXME", "FIXME")
			if err != nil {
				log.Println("Error inserting event into database:", err)
			}

			fmt.Printf("Event: %s\nDate: %s\nDescription: %s\nLocation: %s\nGoogle Maps Link: %s\n",
				cleanedEventName, cleanedEventDate, cleanedEventLocation, cleanedEventDescription, googleMapsLink)
		}
	})

	// Main function to scrape the API for event links
	var scrapePage func(int)
	scrapePage = func(page int) {
		if page > maxPages {
			fmt.Println("Reached max pages. Stopping.")
			return
		}

		apiURL := fmt.Sprintf(baseURL, page)
		fmt.Println("Fetching:", apiURL)

		// Create a new collector for API requests
		apiCollector := colly.NewCollector(
			colly.AllowedDomains("www.visitgainesville.com", "visitgainesville.com"),
			colly.UserAgent("Mozilla/5.0"),
		)

		apiCollector.OnResponse(func(r *colly.Response) {
			var events []Event
			if err := json.Unmarshal(r.Body, &events); err != nil {
				log.Println("JSON parse error:", err)
				return
			}

			// Stop if no more events are found
			if len(events) == 0 {
				fmt.Println("No more events. Stopping.")
				return
			}

			// Visit each event link
			for _, event := range events {
				if event.Link != "" {
					fmt.Println("Visiting event page:", event.Link)
					eventCollector.Visit(event.Link)
					// time.Sleep(500 * time.Millisecond) // Prevent overloading the server
				}
			}

			// Continue to the next page
			scrapePage(page + 1)
		})

		apiCollector.Visit(apiURL)
	}

	// Start scraping from page 1
	scrapePage(page)
}

func ScrapeGainesvilleSun() {
	baseURL := "https://discovery.evvnt.com/api/publisher/458/home_page_events?hitsPerPage=30&multipleEventInstances=true&page=%d&publisher_id=458"
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
				Images json.RawMessage `json:"images"`
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
				err := InsertEventIntoDB(cleanedEventName, cleanedEventDate, cleanedEventLocation, googleMapsLink, cleanedEventDescription, category, cleanedOrganizerName, cleanedEventTags, cleanedImageURL, websiteURL, ticketsURL)
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
