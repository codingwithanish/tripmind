# UX & Functional Specification – Home Page (Suggestion Cards)

## 1. Purpose

The Home Page helps users quickly start travel planning by selecting or completing **predefined intent cards** or by entering a **custom travel sentence**. Each interaction leads the user into a chat flow with the entered intent.

* * *

## 2. Home Page Structure

### 2.1 Card-Based Layout

* The Home Page displays a **vertical list of cards**
    
* Each card represents a **travel intent template**
    
* Cards are rendered **dynamically** based on a JSON response from the backend
    
* Cards are displayed in the order defined by the `order` field in the JSON
    

* * *

## 3. Card Content & Layout

Each card contains:

1. **Template Sentence**
    
    * Derived from `template_text`
        
    * Includes **placeholders** (e.g., `{{trip_type}}`, `{{place}}`)
        
    * Rendered inline as part of the sentence
        
2. **Input Placeholders**
    
    * Each placeholder is rendered as an **inline editable text field**
        
    * Styled to visually blend into the sentence (sentence-first UI)
        
    * Appears as a typing cursor / editable field
        
3. **Arrow Action Button**
    
    * Positioned on the **right side** of the card
        
    * Used to proceed to the chat screen
        

* * *

## 4. Placeholder Behavior

### 4.1 Placeholder Input

* Placeholders are editable inline text fields
    
* Users can:
    
    * Type **custom values**
        
    * Select from suggested options (if provided)
        
* Suggested options are displayed using a **typing / hint UI effect**
    
    * Example values appear visually but are not committed
        

### 4.2 Typing & Value Commitment

* Once the user types a value:
    
    * The typed value becomes the **final and permanent value**
        
    * Suggestions disappear
        
* The field behaves like a normal text input after commitment
    

### 4.3 Validation Rules

* Placeholders marked as `"required": true` must be filled
    
* The arrow button remains **disabled** until:
    
    * All required placeholders are filled with valid values
        

* * *

## 5. Arrow Button Interaction

* The arrow button is:
    
    * **Disabled by default**
        
    * Enabled only when all required placeholders are completed
        
* On click:
    
    * The system captures the **fully resolved sentence**
        
    * The user is navigated to the **chat interface**
        
    * The chat opens with the entered sentence as the **initial user message**
        

* * *

## 6. Backend Integration

### 6.1 API Contract

* Home Page calls a backend service on load
    
* Backend returns a JSON array with the following structure:
    

```json
[
  {
    "id": "1",
    "order": 1,
    "template_text": "I WANT TO DO A {{trip_type}} TRIP TO {{place}}",
    "description": "Template to capture user's travel intent",
    "placeholders": {
      "trip_type": {
        "type": "string",
        "required": true,
        "options": [
          { "value": "SOLO" },
          { "value": "FAMILY" },
          { "value": "FRIENDS" },
          { "value": "COUPLE" }
        ]
      },
      "place": {
        "type": "string",
        "required": true,
        "options": [
          { "value": "Sydney" },
          { "value": "Toronto" },
          { "value": "Paris" },
          { "value": "Tokyo" }
        ]
      }
    }
  }
]
```

### 6.2 Rendering Rules

* Each object in the array generates **one card**
    
* Placeholders are extracted and rendered inline
    
* Options are used only as **UI suggestions**, not enforced values
    

* * *

## 7. Custom Sentence Input (Final Card)

* At the end of the card list:
    
    * Display a **custom input card**
        
* This card contains:
    
    * A single full-width text field
        
    * Placeholder text: **“Type your own”**
        
    * A right-side arrow button
        

### Behavior:

* User can type any free-form travel sentence
    
* Arrow button is enabled once the text field is non-empty
    
* On click:
    
    * User is redirected to the chat
        
    * The typed sentence becomes the initial chat message
        

* * *

## 8. Accessibility & Usability

* Inline input fields must:
    
    * Be keyboard accessible
        
    * Support cursor navigation
        
* Arrow button must:
    
    * Show disabled state clearly
        
    * Be reachable via keyboard
        
* Touch targets must meet mobile accessibility size guidelines
    

* * *

## 9. Error & Edge Cases

* If backend returns an empty array:
    
    * Only the custom input card is shown
        
* If API fails:
    
    * Show fallback message or retry option
        
* If user partially fills a card:
    
    * Arrow remains disabled
        
    * Visual indication highlights missing fields
        

* * *

## 10. Visual Reference

The interaction, layout, and behavior are aligned with the attached wireframe image and should closely follow that structure.
