describe('Profile Menu Tests', () => {
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
    });

    it('should hover over the profile picture and click Update Profile', () => {
        // Hover over the profile picture
        cy.get('#profileid').click();

        // Ensure dropdown is visible before clicking
        cy.get('.dropdown').should('be.visible');

        // Check for the presence of "Update Profile" and "Logout" labels
        cy.get('.dropdown a[href="update_user.html"]').should('exist').and('contain', 'Update Profile');
        cy.get('.dropdown a#logout-link').should('exist').and('contain', 'Logout');

        // Click the Update Profile link in the dropdown
        cy.get('.dropdown a[href="update_user.html"]').click();

        // Verify that the URL is now pointing to update_user.html
        cy.url().should('include', 'update_user.html');

    });
});