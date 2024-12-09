describe('My Listings Page', () => {
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

    it('Checks for Update and Delete buttons in listings', () => {
        // Visit my_listings.html directly
        cy.visit('../PAGES/HTML/my_listings.html');

        // Wait for the listings to be populated
        cy.get('#my-listings-container', { timeout: 10000 }).should('exist');

        // Wait for the actual listings to be loaded
        cy.get('#my-listings-container .item', { timeout: 10000 }).should('have.length.greaterThan', 0);

        // // Check for the pencil (update) and cross (delete) buttons for each listing
        // cy.get('#my-listings-container .item').each(($el) => {
        //     // Check for the green pencil button
        //     cy.wrap($el).find('button').filter(':contains("✏️")').should('exist');

        //     // Check for the red cross button
        //     cy.wrap($el).find('button').filter(':contains("❌")').should('exist');
        // });

        // Click the first pencil (update) button
        cy.get('#my-listings-container .item').first().find('button').filter(':contains("✏️")').click();

        // Verify the update modal appears
        cy.get('.modal', { timeout: 10000 }).should('be.visible'); // Adjust selector for your modal if needed

        // Click Cancel button
        cy.get('button').contains('Cancel').click();

        // Verify that the modal closes 
        cy.get('.modal').should('not.exist');

        // Navigate back to my_listings.html
        cy.visit('../PAGES/HTML/my_listings.html');

        // Click the first cross (delete) button and confirm deletion
        cy.get('#my-listings-container .item').first().find('button').filter(':contains("❌")').click();
        cy.on('window:confirm', () => true); // Automatically confirm deletion
    });

    it('Checks for Pagination Controls', () => {
        cy.visit('../PAGES/HTML/my_listings.html');
        cy.get('#my-next-button').should('exist');
        cy.get('#my-back-button').should('exist');
    });
});