describe('Games Page', () => {
  it('loads live games', () => {
    cy.visit('/games')
    cy.get('#games-table').should('be.visible')
  })

  it('loads finished games', () => {
    cy.visit('/games/history')
    cy.get('#staked-only-games').click({ force: true })
    cy.get('body').then((body) => {
      if (body.find('#games-table').length > 0) {
        cy.get('#games-table').children('#table-container').should('be.visible')
      }
    })
  })
})
