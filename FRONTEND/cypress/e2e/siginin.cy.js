describe('Signup Functionality Tests', () => {
    
    beforeEach(() => {
        // Visit the signup page before each test
        cy.visit('../PAGES/HTML/user_signin.html');
    });
    
    it('should display an alert if not all fields are populated', () => {
        // Fill only some fields
        cy.get('#signup-firstname').type('Alice');
        cy.get('#signup-lastname').type('Smith');
        cy.get('#signup-email').type('alice.smith@example.com');
        // Leave other fields empty

        // Attempt to submit the form
        cy.get('#signup-form').submit();

        // Check for alert about missing fields
        cy.on('window:alert', (txt) => {
            expect(txt).to.contains('Please fill in all fields.');
        });
    });

    it('should only accept a valid 10-digit phone number', () => {
        // Fill out the form with an invalid phone number (less than 10 digits)
        cy.get('#signup-firstname').type('Alice');
        cy.get('#signup-lastname').type('Smith');
        cy.get('#signup-email').type('alice.smith@example.com');
        cy.get('#signup-universityname').select('Massachusetts Institute of Technology (Cambridge, USA)'); // Select a university
        cy.get('#signup-universityid').type('654321');
        cy.get('#signup-phone').type('12345'); // Invalid phone number
        cy.get('#signup-addr').type('789 Oak St');
        cy.get('#signup-password').type('password123');

        // Submit the form
        cy.get('#signup-form').submit();

        // Check for alert about invalid phone number
        cy.on('window:alert', (txt) => {
            expect(txt).to.contains('Please enter a 10-digit phone number.');
        });
    });

    it('should redirect to the login page when the login link is clicked', () => {
        // Click on the login link
        cy.contains('Login').click();

        // Verify the URL of the redirected page using the specific path
        cy.url().should('include', 'login.html'); // Check for the specific page name
        
    });

});