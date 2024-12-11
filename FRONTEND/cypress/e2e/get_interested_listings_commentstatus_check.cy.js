describe('Items and Interested Listings Tests', () => {
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
        
        // Click on the "Interested Items History" button and check if it is visited
        cy.get('button').contains('Interested Items History').click();
        cy.wait(500);
        cy.url().should('include', 'interested_items.html'); // Check if the URL includes interested_items.html
    });

    it('should click on the first View Details button and check Comments and Status', () => {
        // Wait for the page to load and fetch interested listings
        cy.wait(500);

        // Click on the first item's "View Details" button
        cy.get('#interested-items-container .view-button')
            .first() // Get the first button
            .click();
        cy.wait(500);
        // Wait for the page to load and check the URL
        cy.url().should('include', 'get_interested_listings.html');

        // Check for Comments and Status labels
        cy.get('#interested-listings') // Adjust as necessary based on your actual HTML structure
            .should('contain', 'Comments') // Check for the presence of 'Comment' label
            .and('contain', 'Status'); // Check for the presence of 'Status' label
    });
});