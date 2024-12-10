describe('Items and Available Listings Tests', () => {
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
    });

    it('should navigate to available listings and check that the Mark Interested button is visible', () => {
        // Navigate to items.html
        cy.visit('../PAGES/HTML/items.html');

        // Find the first item that does not have both the green update button and the red delete button
        cy.get('#item-list .item') // Adjust this selector based on your actual item structure
            .each(($el) => {
                // Check for the presence of the green pencil (update) button and the red delete button
                const hasPencilButton = $el.find('button').filter(':contains("✏️")').length > 0;
                const hasCrossButton = $el.find('button').filter(':contains("❌")').length > 0;

                // If the item does not have both buttons
                if (!hasPencilButton && !hasCrossButton) {
                    // Click the item itself to navigate to available_listings.html
                    cy.wrap($el).click();

                    // Wait for the next page to load
                    cy.url().should('include', 'available_listings.html');
                    cy.wait(500);

                    // Check that the "Mark as Interested" button is visible
                    cy.get('#mark-interested-button').should('be.visible');

                    // Break the loop after clicking the first found item
                    return false; // This will break the each loop
                }
            });
    });
});