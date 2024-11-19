const dal = require('./dal');

test('additionner 1 + 2 égale 3', () => {
	expect(somme(1, 2)).toEqual(3);
}); 
