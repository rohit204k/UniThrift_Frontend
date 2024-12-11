describe('Admin Login and All Listings Page', () => {
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

        // Navigate to the All Listings page
        cy.get('a[href="all_listings.html"]').click();
        cy.url().should('include', 'all_listings.html');
    });

    it('should display the item list section', () => {
        // Verify that the item list section is present
        cy.get('#item-list').should('exist');
    });

    it('should display a delete button for each listing item', () => {
        // Intercept the request to get the listings data
        cy.intercept('GET', 'http://18.117.164.164:4001/api/v1/listing/get_listings?page=1&page_size=16').as('getListings');

        // Verify that each item has a delete button
        cy.get('#item-list .item').each(($item) => {
            cy.wrap($item).find('button.delete-btn').should('exist'); // Check for the delete button
        });
    });
    it('should paginate through the listings', () => {
        // Click the "Next" button
        cy.get('#nextBtn').click();
        // Check if the "Previous" button is enabled
        cy.get('#prevBtn').should('not.be.disabled');
    });
});