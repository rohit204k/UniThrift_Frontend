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

    it('should check for the presence of the View Details button', () => {
        // Wait for the page to load and fetch interested listings
        cy.wait(500);

        // Check for the presence of the "View Details" button
        cy.get('#interested-items-container .view-button')
            .should('exist')
            .and('be.visible');
    });
});