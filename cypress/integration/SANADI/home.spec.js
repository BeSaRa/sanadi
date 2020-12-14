describe('Home Test', () => {
  it('check if the landing page loaded after click login', () => {
    cy.visit('http://eblaepm.no-ip.org:9080/ui/#/loading/entity/motc');

    cy.get('input[name=username]').type('nr2')
    cy.get('input[type=password]').type('quality')
    cy.get('button#login-button').click();
    cy.url().should('contain','landing-page');
  })
})
