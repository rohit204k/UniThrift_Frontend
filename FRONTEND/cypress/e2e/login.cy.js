describe('Login Page Tests', () => {
    beforeEach(() => {
        // Visit the login page relative to the Cypress test file structure
        cy.visit('../PAGES/HTML/login.html');
    });

    it('Validates that email field expects a valid email ID', () => {
        // Enter an invalid email and valid password
        cy.get('#login-email').type('invalidemail');
        cy.get('#login-password').type('validpassword');
        
        // Submit the form
        cy.get('#login-form').submit();

        // Check for an alert with the expected message
        cy.on('window:alert', (alertText) => {
            expect(alertText).to.equal('Include @');
        });
    });

    it('Checks "Reset Password" link redirects to the Reset Password page', () => {
        // Click on the "Reset Password" link
        cy.get('#forgot-password-link').click();

        // Verify the URL contains the reset password page
        cy.url().should('include', 'reset_password_mail.html');
    });

    it('Checks "Sign Up" link redirects to the Student Sign Up page', () => {
        // Click on the "Sign Up" link
        cy.contains('Sign Up').click();

        // Verify the URL contains the signup page
        cy.url().should('include', 'user_signin.html');
    });

    it('Validates login error for invalid credentials', () => {
        // Enter an invalid email and password
        cy.get('#login-email').type('test@invalid.com');
        cy.get('#login-password').type('wrongpassword');
        cy.get('#login-form').submit();

        // Check that the error message is displayed
        cy.get('#login-error').should('be.visible').and('contain', 'Invalid email or password. Please try again.');
    });
});
