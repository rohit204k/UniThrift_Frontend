describe('Admin Login and Category Management Page', () => {
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

        // Navigate to the Category Management page
        cy.get('a[href="category_management.html"]').click();
        cy.url().should('include', 'category_management.html');
    });

    it('should add a new category', () => {
        // Click the "Add Category" button
        const newCategoryName = 'add';
        cy.get('#add-category-button').click();
        cy.get('#category-name').type(newCategoryName);
        cy.get('#category-description').type('Description for new category');
        cy.get('#category-form').submit();

        // Verify that the new category is displayed
        cy.get('#categories').should('contain', newCategoryName);
    });

    it('should delete an existing category', () => {
        // Step 1: Add a category first
        cy.get('#add-category-button').click();
        cy.get('#category-name').type('Category to Delete');
        cy.get('#category-description').type('Description');
        cy.get('#category-form').submit();

        // Step 2: Click the delete button (cross) for the first category
        cy.get('#categories li').first().find('button').contains('❌').click();
        
        // Step 3: Automatically confirm deletion
        cy.on('window:confirm', () => true); // Confirm the delete action

        // Step 4: Verify that the category is no longer present
        cy.get('#categories').should('not.contain', 'Category to Delete');
    });

    it('should handle cancel action in category dialog', () => {
        cy.get('#add-category-button').click();
        cy.get('#category-name').type('Temp Category');
        cy.get('#category-description').type('Temporary description');

        // Click Cancel button
        cy.get('#cancel-button').click();

        // Verify that the dialog closes and no category is added
        cy.get('#categories').should('not.contain', 'Temp Category');
    });
});