import Ingredient from '../shared/ingredient.model';

export default class Recipe {
  constructor(
    public name: string,
    public description: string,
    public imagePath: string,
    public ingredients: Ingredient[]) {}
}
