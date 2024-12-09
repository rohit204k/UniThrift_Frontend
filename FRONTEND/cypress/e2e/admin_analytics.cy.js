describe('Admin Login and Analytics Page', () => {
    beforeEach(() => {
        // Visit the login page before each test
        cy.visit('../PAGES/HTML/admin_login.html');

        // Intercept the login request
        cy.intercept('POST', 'http://18.117.164.164:4001/api/v1/admin/login', (req) => {
            req.reply((res) => {
                const accessToken = res.body.data.access_token;
                cy.window().then((win) => {
                    win.localStorage.setItem('accessToken', accessToken);
                });
            });
        }).as('loginRequest');

        // Fill in the login form
        cy.get('#login-email').type('sahanapkachar@gmail.com');
        cy.get('#login-password').type('Test');
        cy.get('#login-form').submit();
        cy.wait('@loginRequest');

        // Log the current URL for debugging
        cy.url().then((url) => {
            cy.log('Current URL after login attempt:', url);
        });

        // Verify the URL is correct after login
        cy.url().should('include', 'admin_analytics.html');
    });

    it('should log in successfully and redirect to admin analytics page', () => {
        // Visit the login page
        cy.visit('../PAGES/HTML/admin_login.html');

        // Fill in the login form
        cy.get('#login-email').type('sahanapkachar@gmail.com');
        cy.get('#login-password').type('Test');
        
        // Submit the login form
        cy.get('#login-form').submit();
        cy.wait(500);
        // Log the current URL for debugging
        cy.url().then((url) => {
            cy.log('Current URL after login attempt:', url);
        });

        // Verify the URL is correct after login
        cy.url().should('include', 'admin_analytics.html');
    });


    it('should display key elements on admin analytics page', () => {
        // Visit the admin analytics page directly (assuming user is already logged in)
        cy.visit('../PAGES/HTML/admin_analytics.html');

        // Verify the presence of key elements
        cy.get('h1').should('contain', 'Admin Analytics');
        cy.get('#total-revenue').should('exist');
        cy.get('#mostListedItemsChart').should('exist');
        cy.get('#mostInquiredItemsChart').should('exist');
        cy.get('#revenueTimeSeriesChart').should('exist');
    });

     it('should hover over the profile picture and check presence of Update profile and logout', () => {
        // Hover over the profile picture
        cy.get('#profileid').click();

        // Ensure dropdown is visible before clicking
        cy.get('.dropdown').should('be.visible');

        // Check for the presence of "Update Profile" and "Logout" labels
        cy.get('.dropdown a[href="update_admin.html"]').should('exist').and('contain', 'Update Profile');
        cy.get('.dropdown a#logout-link').should('exist').and('contain', 'Logout');

    });
});