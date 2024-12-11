describe('My Listings Tests', () => {
    let accessToken;

    beforeEach(() => {
        // Visit the login page before each test
        cy.visit('../PAGES/HTML/login.html');
        
        // Intercept the login request
        cy.intercept('POST', 'http://18.117.164.164:4001/api/v1/student/login', (req) => {
            req.reply((res) => {
                const accessToken = res.body.data.access_token;
                cy.window().then((win) => {
                    win.localStorage.setItem('accessToken', accessToken);
                });
            });
        }).as('loginRequest');
        
        // Fill in the login form
        cy.get('#login-email').type('spattekeshav@umass.edu');
        cy.get('#login-password').type('Test');
        cy.get('#login-form').submit();
        cy.wait('@loginRequest');
        cy.url().should('include', 'items.html');
        cy.wait(500);
        // Click on the "My Listings" button and check if it is visited
        cy.get('button').contains('My Listings').click();
        cy.wait(500);
        cy.url().should('include', 'my_listings.html'); // Check if the URL includes my_listings.html
    });

    it('should navigate to interested listings and check button visibility', () => {
        // Wait for the page to load
        cy.wait(500);
        
        // Find the first item that does not have both the green update button and the red delete button
        cy.get('#my-listings-container .item') // Adjust this selector based on your actual item structure
            .each(($el) => {
                // Check for the presence of the green pencil (update) button and the red delete button
                const hasPencilButton = $el.find('button').filter(':contains("✏️")').length > 0;
                const hasCrossButton = $el.find('button').filter(':contains("❌")').length > 0;

                // If the item does not have both buttons
                if (hasPencilButton && hasCrossButton) {
                    // Click the item itself to navigate to get_interested_listings_seller.html
                    cy.wrap($el).click();

                    // Wait for the next page to load
                    cy.url().should('include', 'get_interested_listings_seller.html');
                    cy.wait(500);

                    // Check that the "Share Contact," "Reject Interest," and "Sale Complete" buttons are visible
                    cy.get('button').contains('SHARE CONTACT').should('be.visible');
                    cy.get('button').contains('REJECT INTEREST').should('be.visible');
                    cy.get('button').contains('SALE COMPLETE').should('be.visible');

                    // Break the loop after clicking the first found item
                    return false; // This will break the each loop
                }
            });
    });
});