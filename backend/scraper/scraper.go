package scraper

import (
	"encoding/json"
	"fmt"
	"log"
	"regexp"
	"strconv"
	"strings"
	"time"

	"backend/data"
	"backend/database"

	"github.com/gocolly/colly"
	"github.com/muesli/gominatim"
)

type Event struct {
	Link string `json:"link"`
}

func InsertEventIntoDB(name, date, location, googleMapsLink, description string) error {
	// Check if the event already exists in the database
	var existingEvent data.Event
	if err := database.DB.Where("name = ? AND date = ? AND location = ?", name, date, location).First(&existingEvent).Error; err == nil {
		// Event already exists, return without inserting
		return nil
	}

	// Insert the event into the database
	event := data.Event{
		Name:           name,
		Date:           date,
		Location:       location,
		Description:    description,
		GoogleMapsLink: googleMapsLink,
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

		err := InsertEventIntoDB(cleanedEventName, cleanedEventDate, cleanedEventLocation, googleMapsLink, cleanedEventDescription)
		if err != nil {
			log.Println("Error inserting event into database:", err)
		}

		fmt.Printf("Event: %s\nDate: %s\nDescription: %s\nLocation: %s\nGoogle Maps Link: %s\n",
			cleanedEventName, cleanedEventDate, cleanedEventLocation, cleanedEventDescription, googleMapsLink)
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
					time.Sleep(500 * time.Millisecond) // Prevent overloading the server
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
