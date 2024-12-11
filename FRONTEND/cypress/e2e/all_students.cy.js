describe('Admin Login and All Students Page', () => {
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

        // Navigate to the All Students page
        cy.get('a[href="all_students.html"]').click();
        cy.url().should('include', 'all_students.html');
    });

    it('should display the student table with the correct headers', () => {
        // Verify that the table headers are displayed correctly
        cy.get('#student-table thead tr th').should('have.length', 4);
        cy.get('#student-table th').eq(0).should('contain', 'FirstName');
        cy.get('#student-table th').eq(1).should('contain', 'Last Name');
        cy.get('#student-table th').eq(2).should('contain', 'Email');
        cy.get('#student-table th').eq(3).should('contain', 'UniversityID');
    });

});