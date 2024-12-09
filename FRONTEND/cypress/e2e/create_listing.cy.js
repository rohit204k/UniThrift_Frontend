describe('Create Listing Page', () => {
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

        // Navigate to create listing page
        cy.visit('../PAGES/HTML/create_listing.html');
    });
    it('should create a new item listing', () => {
        // Wait for the form to load
        cy.get('#create-item-form', { timeout: 10000 }).should('exist');
    
        // Fill in the form fields
        cy.get('#title').type('New Item Title');
        cy.get('#category').select('Chair'); // Ensure this category exists in your dropdown
        cy.get('#description').type('This is a description for the new item.');
        cy.get('#price').type('150');
    
        // Upload an image (use a fixture image)
        const filePath = '../../PAGES/TEMPLATES/profile-picture.jpg'; // Adjust this path to your image fixture
        cy.get('#image').attachFile(filePath);
    
        // Intercept the API call for creating a listing
        cy.intercept('POST', 'http://18.117.164.164:4001/api/v1/listing/create').as('createListing');
    
        // Submit the form
        cy.get('#create-item-form').submit();
    
        // Wait for the create listing request to complete and check the response status code
        cy.wait('@createListing').then((interception) => {
            expect(interception.response.statusCode).to.eq(200);
        });
    });

    it('should not allow submission with empty fields', () => {
        // Attempt to submit the form without filling any fields
        cy.get('#create-item-form').submit();

        // Check that required fields show validation errors
        cy.get('#title:invalid').should('exist');
        cy.get('#category:invalid').should('exist');
        cy.get('#description:invalid').should('exist');
        cy.get('#price:invalid').should('exist');
    });

    it('should not allow submission with invalid price', () => {
        // Fill in some fields but set price to a non-numeric value
        cy.get('#title').type('New Item Title');
        cy.get('#category').select('Chair'); // Ensure this category exists in your dropdown
        cy.get('#description').type('This is a description for the new item.');
        cy.get('#price').type('NotANumber'); // Invalid price

        // Attempt to submit the form
        cy.get('#create-item-form').submit();

        // Check that the price field shows a validation error
        cy.get('#price:invalid').should('exist');
    });

    it('should navigate back to items page', () => {
        // Navigate back to items page
        cy.get('#back-button').click();

        // Verify URL is correct
        cy.url().should('include', 'items.html');
    });
});