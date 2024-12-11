describe('Login and Items page', () => {
    beforeEach(() => {
        cy.visit('../PAGES/HTML/login.html');
    });

    it('Logs in successfully and redirects to items.html', () => {
        // Intercept the login request
        cy.intercept('POST', 'http://18.117.164.164:4001/api/v1/student/login', (req) => {
            req.reply((res) => {
                // Capture the access token from the response
                const accessToken = res.body.data.access_token;
                // Store the access token in local storage
                cy.window().then((win) => {
                    win.localStorage.setItem('accessToken', accessToken);
                });
            });
        }).as('loginRequest');

        // Fill in the login form
        cy.get('#login-email').type('spattekeshav@umass.edu');
        cy.get('#login-password').type('Test');
        cy.get('#login-form').submit();

        // Wait for the login request to complete
        cy.wait('@loginRequest');

        // Check for successful login
        cy.url().should('include', 'items.html');

        // Validate access token in local storage
        cy.window().its('localStorage').invoke('getItem', 'accessToken').should('not.be.empty');
    });

    it('Checks navigation menu - all tabs', () => {
        // Visit items.html directly, assuming login was successful
        cy.visit('../PAGES/HTML/items.html');

        // Test navigation to All Available Listings
        cy.get('button').contains('All Available Listings').click();
        cy.url().should('include', 'items.html');

        // Test navigation to Interested Items History
        cy.get('button').contains('Interested Items History').click();
        cy.url().should('include', 'interested_items.html');

        // Test navigation to Create Item Listing
        cy.get('button').contains('Create Item Listing').click();
        cy.url().should('include', 'create_listing.html');

    });

});