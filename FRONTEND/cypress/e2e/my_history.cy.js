describe('Login and My History Page Tests', () => {
    beforeEach(() => {
        // Visit the login page
        cy.visit('../PAGES/HTML/login.html');
        // Fill in the login form
        cy.get('#login-email').type('spattekeshav@umass.edu');
        cy.get('#login-password').type('Test');
        cy.get('#login-form').submit();

        // Check for successful login
        cy.url().should('include', 'items.html');
        cy.wait(500); // Consider using a more reliable method instead of wait
    });

    it('Displays sold items list when clicked', () => {
        // Visit the My History page
        cy.visit('../PAGES/HTML/my_history.html');

        // Click on the Sold Items button
        cy.get('#sold-button').click();

        // Verify that the sold items list is visible
        cy.get('#sold-items-list').should('be.visible');
        
        // Assert that the bought items list is hidden
        cy.get('#bought-items-list').should('not.be.visible');

        // Optionally check if sold items are displayed
        cy.get('#sold-items-list').children().should('have.length.greaterThan', 0);
    });
    it('Displays bought items list when clicked', () => {
        // Visit the My History page
        cy.visit('../PAGES/HTML/my_history.html');

        // Ensure there's at least one bought item
        cy.get('#bought-items-list').children().should('have.length.greaterThan', 0);

        // Click on the Bought Items button
        cy.get('#bought-button').click();

        // Verify that the bought items list is visible
        cy.get('#bought-items-list').should('be.visible');

        // Assert that the sold items list is hidden
        cy.get('#sold-items-list').should('not.be.visible');

        // Optionally check if bought items are displayed
        cy.get('#bought-items-list').children().should('have.length.greaterThan', 0);
    });

});