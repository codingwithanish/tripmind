# UX Specification – Header Bar (Mobile & Desktop)

## 1. Purpose

The header bar provides global navigation and user account access. Its layout and interactions must adapt seamlessly to **mobile** and **desktop** devices while maintaining consistency and usability.

* * *

## 2. Common Elements (All Devices)

* **Logo**
    
    * Positioned at the top of the screen
        
    * Clicking the logo navigates the user to the **Home** page
        
* Header remains **visible across all pages**
    
* Header height should remain consistent across the application
    

* * *

## 3. Mobile View Specification

### 3.1 Layout

* Header bar contains:
    
    * **Logo** aligned to the **left**
        
    * **Menu (hamburger) icon** aligned to the **right**
        
* No inline navigation text is shown in mobile view
    

* * *

### 3.2 Menu Drawer Interaction

* Tapping the menu icon opens a **side drawer**
    
* Drawer slides in from the **left side**
    
* Drawer overlays the current screen content
    

* * *

### 3.3 Menu Drawer Content

The drawer displays the following options in vertical order:

1. **Home**
    
2. **My Travel**
    
3. **Notifications**
    
4. **Profile** _(visible only if the user is logged in)_
    
5. **Logout** _(visible only if the user is logged in)_
    

* * *

### 3.4 Drawer Behavior

* Tapping any menu item:
    
    * Navigates to the selected page
        
    * Closes the drawer
        
* Drawer can be closed by:
    
    * Tapping outside the drawer
        
    * Tapping the menu icon again
        

* * *

## 4. Desktop View Specification

### 4.1 Layout

* Header bar contains:
    
    * **Logo** aligned to the **left**
        
    * Navigation items aligned horizontally to the **right of the logo**
        
* Navigation items include:
    
    * **Home** (text link)
        
    * **My Travel** (text link)
        
    * **Notifications** (icon-only)
        
    * **User Profile icon**
        

* * *

### 4.2 Navigation Behavior

* Clicking **Home** or **My Travel** navigates directly to the respective pages
    
* **Notifications icon**:
    
    * Displays notification count badge (if applicable)
        
    * Navigates to the Notifications page on click
        

* * *

### 4.3 Profile Dropdown Interaction

* Clicking the **User Profile icon** opens a **dropdown menu**
    
* Dropdown is aligned below the profile icon
    
* Dropdown contains:
    
    1. **Profile**
        
    2. **Logout**
        

* * *

### 4.4 Dropdown Behavior

* Dropdown closes when:
    
    * A menu item is selected
        
    * User clicks outside the dropdown
        
* Selecting:
    
    * **Profile** → navigates to Profile page
        
    * **Logout** → logs the user out and redirects to Home page
        

* * *

## 5. Authentication-Based Visibility Rules

* **Logged-out users**:
    
    * Mobile drawer does **not** show Profile or Logout
        
    * Desktop view hides Profile icon entirely
        
* **Logged-in users**:
    
    * Profile and Logout options become visible
        
    * Profile icon is always displayed in desktop view
        

* * *

## 6. Accessibility Requirements

* Menu and profile icons must be:
    
    * Keyboard navigable
        
    * Screen-reader accessible
        
* Icons must include:
    
    * `aria-label` attributes
        
* Touch targets should meet minimum size guidelines (44×44 px)
    

* * *

## 7. Responsive Breakpoints

* **Mobile view**: ≤ 768px width
    
* **Desktop view**: > 768px width
    

* * *

## 8. Error & Edge Cases

* If user session expires:
    
    * Header updates immediately to logged-out state
        
* If notifications fail to load:
    
    * Notification icon still visible
        
    * Badge hidden
        

* * *

## 9. Visual Reference

Refer to the attached wireframe image for layout positioning and interaction flow.
