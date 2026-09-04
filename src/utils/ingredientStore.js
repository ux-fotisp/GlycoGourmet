/**
 * ingredientStore.js — Strapi CMS Ingredient Data Layer
 *
 * Architecture:
 * - Single source of truth for all system and custom ingredients is Strapi CMS (`/api/ingredients`).
 * - Custom (user-authored) ingredients are POSTed directly to `/api/ingredients` using Strapi JWT.
 * - All responses are normalized via `unravelStrapiData`.
 * - No local JSON database files or localStorage fallback storage are used.
 */

import { strapiGet, strapiPost, invalidateCache } from '../services/strapiClient';

const COLLECTION = '/api/ingredients';
const CUSTOM_ID_PREFIX = 'custom-';

export const VALID_CATEGORIES = [
  'protein', 'grain', 'vegetable', 'fat',
  'dairy', 'legume', 'fruit', 'seasoning', 'cheese',
];

export const VALID_UNITS = [
  'g', 'oz', 'cup', 'tbsp', 'tsp', 'piece', 'bunch', 'clove',
];

const DEFAULT_SEED_INGREDIENTS = [
  {
    "id": "beef-short-ribs",
    "name": "Braised Beef Short Ribs",
    "category": "protein",
    "defaultAmount": 100,
    "defaultUnit": "g",
    "defaultPrepState": "boiled",
    "kcal": 295,
    "protein": 24.5,
    "fat": 21.8,
    "carbs": 0,
    "fiber": 0,
    "netCarbs": 0,
    "glycemicIndex": 0,
    "glycemicLoad": 0,
    "isUserAuthored": false
  },
  {
    "id": "atlantic-salmon",
    "name": "Atlantic Salmon",
    "category": "protein",
    "defaultAmount": 100,
    "defaultUnit": "g",
    "defaultPrepState": "raw",
    "kcal": 206,
    "protein": 22,
    "fat": 13,
    "carbs": 0,
    "fiber": 0,
    "netCarbs": 0,
    "glycemicIndex": 0,
    "glycemicLoad": 0,
    "isUserAuthored": false
  },
  {
    "id": "herb-asparagus",
    "name": "Asparagus",
    "category": "vegetable",
    "defaultAmount": 100,
    "defaultUnit": "g",
    "defaultPrepState": "raw",
    "kcal": 20,
    "protein": 2.2,
    "fat": 0.1,
    "carbs": 3.9,
    "fiber": 2.1,
    "netCarbs": 1.8,
    "glycemicIndex": 15,
    "glycemicLoad": 0.3,
    "isUserAuthored": false
  },
  {
    "id": "almond-flour",
    "name": "Almond Flour",
    "category": "grain",
    "defaultAmount": 100,
    "defaultUnit": "g",
    "defaultPrepState": "raw",
    "kcal": 590,
    "protein": 21,
    "fat": 50,
    "carbs": 20,
    "fiber": 10,
    "netCarbs": 10,
    "glycemicIndex": 15,
    "glycemicLoad": 1.5,
    "isUserAuthored": false
  },
  {
    "id": "quinoa-cooked",
    "name": "Quinoa (Cooked)",
    "category": "grain",
    "defaultAmount": 100,
    "defaultUnit": "g",
    "defaultPrepState": "boiled",
    "kcal": 120,
    "protein": 4.4,
    "fat": 1.9,
    "carbs": 21.3,
    "fiber": 2.8,
    "netCarbs": 18.5,
    "glycemicIndex": 53,
    "glycemicLoad": 9.8,
    "isUserAuthored": false
  },
  {
    "id": "white-rice-cooked",
    "name": "White Rice (Cooked)",
    "category": "grain",
    "defaultAmount": 100,
    "defaultUnit": "g",
    "defaultPrepState": "boiled",
    "kcal": 130,
    "protein": 2.7,
    "fat": 0.3,
    "carbs": 28,
    "fiber": 0.4,
    "netCarbs": 27.6,
    "glycemicIndex": 73,
    "glycemicLoad": 20.1,
    "isUserAuthored": false
  },
  {
    "id": "avocado",
    "name": "Avocado",
    "category": "fat",
    "defaultAmount": 100,
    "defaultUnit": "g",
    "defaultPrepState": "raw",
    "kcal": 160,
    "protein": 2,
    "fat": 15,
    "carbs": 8.5,
    "fiber": 6.7,
    "netCarbs": 1.8,
    "glycemicIndex": 15,
    "glycemicLoad": 0.3,
    "isUserAuthored": false
  },
  {
    "id": "greek-yogurt",
    "name": "Greek Yogurt",
    "category": "dairy",
    "defaultAmount": 100,
    "defaultUnit": "g",
    "defaultPrepState": "raw",
    "kcal": 59,
    "protein": 10,
    "fat": 0.4,
    "carbs": 3.6,
    "fiber": 0,
    "netCarbs": 3.6,
    "glycemicIndex": 11,
    "glycemicLoad": 0.4,
    "isUserAuthored": false
  },
  {
    "id": "strawberries",
    "name": "Strawberries",
    "category": "fruit",
    "defaultAmount": 100,
    "defaultUnit": "g",
    "defaultPrepState": "raw",
    "kcal": 32,
    "protein": 0.7,
    "fat": 0.3,
    "carbs": 7.7,
    "fiber": 2,
    "netCarbs": 5.7,
    "glycemicIndex": 25,
    "glycemicLoad": 1.4,
    "isUserAuthored": false
  },
  {
    "id": "olive-oil",
    "name": "Extra Virgin Olive Oil",
    "category": "fat",
    "defaultAmount": 14,
    "defaultUnit": "g",
    "defaultPrepState": "raw",
    "kcal": 119,
    "protein": 0,
    "fat": 13.5,
    "carbs": 0,
    "fiber": 0,
    "netCarbs": 0,
    "glycemicIndex": 0,
    "glycemicLoad": 0,
    "isUserAuthored": false
  },
  {
    "id": "chicken-breast",
    "name": "Chicken Breast",
    "category": "protein",
    "defaultAmount": 100,
    "defaultUnit": "g",
    "defaultPrepState": "raw",
    "kcal": 165,
    "protein": 31,
    "fat": 3.6,
    "carbs": 0,
    "fiber": 0,
    "netCarbs": 0,
    "glycemicIndex": 0,
    "glycemicLoad": 0,
    "isUserAuthored": false
  },
  {
    "id": "broccoli",
    "name": "Broccoli",
    "category": "vegetable",
    "defaultAmount": 100,
    "defaultUnit": "g",
    "defaultPrepState": "raw",
    "kcal": 34,
    "protein": 2.8,
    "fat": 0.4,
    "carbs": 6.6,
    "fiber": 2.6,
    "netCarbs": 4,
    "glycemicIndex": 15,
    "glycemicLoad": 0.6,
    "isUserAuthored": false
  },
  {
    "id": "spinach",
    "name": "Fresh Spinach",
    "category": "vegetable",
    "defaultAmount": 100,
    "defaultUnit": "g",
    "defaultPrepState": "raw",
    "kcal": 23,
    "protein": 2.9,
    "fat": 0.4,
    "carbs": 3.6,
    "fiber": 2.2,
    "netCarbs": 1.4,
    "glycemicIndex": 15,
    "glycemicLoad": 0.2,
    "isUserAuthored": false
  },
  {
    "id": "chia-seeds",
    "name": "Chia Seeds",
    "category": "grain",
    "defaultAmount": 28,
    "defaultUnit": "g",
    "defaultPrepState": "raw",
    "kcal": 138,
    "protein": 4.7,
    "fat": 8.7,
    "carbs": 12,
    "fiber": 9.8,
    "netCarbs": 2.2,
    "glycemicIndex": 15,
    "glycemicLoad": 0.3,
    "isUserAuthored": false
  },
  {
    "id": "almond-milk",
    "name": "Unsweetened Almond Milk",
    "category": "dairy",
    "defaultAmount": 240,
    "defaultUnit": "g",
    "defaultPrepState": "raw",
    "kcal": 30,
    "protein": 1,
    "fat": 2.5,
    "carbs": 1,
    "fiber": 0.5,
    "netCarbs": 0.5,
    "glycemicIndex": 15,
    "glycemicLoad": 0.1,
    "isUserAuthored": false
  },
  {
    "id": "lupin-flour",
    "name": "Lupin Flour",
    "category": "grain",
    "defaultAmount": 100,
    "defaultUnit": "g",
    "defaultPrepState": "raw",
    "kcal": 371,
    "protein": 39,
    "fat": 9.9,
    "carbs": 40,
    "fiber": 28,
    "netCarbs": 12,
    "glycemicIndex": 15,
    "glycemicLoad": 2,
    "isUserAuthored": false
  },
  {
    "id": "shirataki-noodles",
    "name": "Konjac Shirataki Noodles",
    "category": "grain",
    "defaultAmount": 100,
    "defaultUnit": "g",
    "defaultPrepState": "boiled",
    "kcal": 10,
    "protein": 0.2,
    "fat": 0,
    "carbs": 5.4,
    "fiber": 4.9,
    "netCarbs": 0.5,
    "glycemicIndex": 0,
    "glycemicLoad": 0,
    "isUserAuthored": false
  },
  {
    "id": "chia-seeds-black",
    "name": "Black Seedless Chia Seeds",
    "category": "grain",
    "defaultAmount": 100,
    "defaultUnit": "g",
    "defaultPrepState": "raw",
    "kcal": 486,
    "protein": 16.5,
    "fat": 30.7,
    "carbs": 42.1,
    "fiber": 34.4,
    "netCarbs": 7.7,
    "glycemicIndex": 1,
    "glycemicLoad": 1,
    "isUserAuthored": false
  },
  {
    "id": "romanesco-broccoli",
    "name": "Romanesco Broccoli",
    "category": "vegetable",
    "defaultAmount": 100,
    "defaultUnit": "g",
    "defaultPrepState": "raw",
    "kcal": 25,
    "protein": 3,
    "fat": 0.3,
    "carbs": 5,
    "fiber": 3.2,
    "netCarbs": 1.8,
    "glycemicIndex": 15,
    "glycemicLoad": 0,
    "isUserAuthored": false
  },
  {
    "id": "hemp-hearts",
    "name": "Organic Hemp Hearts",
    "category": "fat",
    "defaultAmount": 100,
    "defaultUnit": "g",
    "defaultPrepState": "raw",
    "kcal": 553,
    "protein": 31.6,
    "fat": 48.7,
    "carbs": 8.7,
    "fiber": 4,
    "netCarbs": 4.7,
    "glycemicIndex": 4,
    "glycemicLoad": 0,
    "isUserAuthored": false
  },
  {
    "id": "black-cod",
    "name": "Wild Alaskan Black Cod / Sablefish",
    "category": "protein",
    "defaultAmount": 100,
    "defaultUnit": "g",
    "defaultPrepState": "raw",
    "kcal": 250,
    "protein": 17.2,
    "fat": 20.1,
    "carbs": 0,
    "fiber": 0,
    "netCarbs": 0,
    "glycemicIndex": 0,
    "glycemicLoad": 0,
    "isUserAuthored": false
  },
  {
    "id": "red-miso-paste",
    "name": "Red Miso Paste",
    "category": "seasoning",
    "defaultAmount": 100,
    "defaultUnit": "g",
    "defaultPrepState": "raw",
    "kcal": 198,
    "protein": 12.8,
    "fat": 6,
    "carbs": 25.4,
    "fiber": 5.4,
    "netCarbs": 20,
    "glycemicIndex": 30,
    "glycemicLoad": 1,
    "isUserAuthored": false
  },
  {
    "id": "sesame-oil",
    "name": "Sesame Oil",
    "category": "fat",
    "defaultAmount": 14,
    "defaultUnit": "g",
    "defaultPrepState": "raw",
    "kcal": 884,
    "protein": 0,
    "fat": 100,
    "carbs": 0,
    "fiber": 0,
    "netCarbs": 0,
    "glycemicIndex": 0,
    "glycemicLoad": 0,
    "isUserAuthored": false
  },
  {
    "id": "sliced-almonds",
    "name": "Sliced Almonds",
    "category": "legume",
    "defaultAmount": 100,
    "defaultUnit": "g",
    "defaultPrepState": "raw",
    "kcal": 579,
    "protein": 21.2,
    "fat": 49.9,
    "carbs": 21.6,
    "fiber": 12.5,
    "netCarbs": 9.1,
    "glycemicIndex": 15,
    "glycemicLoad": 1,
    "isUserAuthored": false
  },
  {
    "id": "lemon-juice",
    "name": "Fresh Lemon Juice",
    "category": "fruit",
    "defaultAmount": 20,
    "defaultUnit": "g",
    "defaultPrepState": "raw",
    "kcal": 22,
    "protein": 0.4,
    "fat": 0.2,
    "carbs": 6.9,
    "fiber": 0.3,
    "netCarbs": 6.6,
    "glycemicIndex": 20,
    "glycemicLoad": 0,
    "isUserAuthored": false
  },
  {
    "id": "extra-virgin-olive-oil",
    "name": "Extra Virgin Olive Oil",
    "category": "fat",
    "defaultAmount": 14,
    "defaultUnit": "g",
    "defaultPrepState": "raw",
    "kcal": 884,
    "protein": 0,
    "fat": 100,
    "carbs": 0,
    "fiber": 0,
    "netCarbs": 0,
    "glycemicIndex": 0,
    "glycemicLoad": 0,
    "isUserAuthored": false
  },
  {
    "id": "almond-milk-unsweetened",
    "name": "Unsweetened Almond Milk",
    "category": "dairy",
    "defaultAmount": 240,
    "defaultUnit": "g",
    "defaultPrepState": "raw",
    "kcal": 30,
    "protein": 1,
    "fat": 2.5,
    "carbs": 1,
    "fiber": 0.5,
    "netCarbs": 0.5,
    "glycemicIndex": 15,
    "glycemicLoad": 0.1,
    "isUserAuthored": false
  },
  {
    "id": "eggs",
    "name": "Large Hard-Boiled Eggs",
    "category": "protein",
    "defaultAmount": 100,
    "defaultUnit": "g",
    "defaultPrepState": "boiled",
    "kcal": 143,
    "protein": 12.6,
    "fat": 9.5,
    "carbs": 0.7,
    "fiber": 0,
    "netCarbs": 0.7,
    "glycemicIndex": 0,
    "glycemicLoad": 0,
    "isUserAuthored": false
  },
  {
    "id": "dijon-mustard",
    "name": "Dijon Mustard",
    "category": "seasoning",
    "defaultAmount": 100,
    "defaultUnit": "g",
    "defaultPrepState": "raw",
    "kcal": 66,
    "protein": 4.4,
    "fat": 4,
    "carbs": 3.3,
    "fiber": 1.5,
    "netCarbs": 1.8,
    "glycemicIndex": 15,
    "glycemicLoad": 0.3,
    "isUserAuthored": false
  },
  {
    "id": "celery",
    "name": "Celery",
    "category": "vegetable",
    "defaultAmount": 100,
    "defaultUnit": "g",
    "defaultPrepState": "raw",
    "kcal": 14,
    "protein": 0.7,
    "fat": 0.2,
    "carbs": 3,
    "fiber": 1.6,
    "netCarbs": 1.4,
    "glycemicIndex": 15,
    "glycemicLoad": 0.2,
    "isUserAuthored": false
  },
  {
    "id": "chives",
    "name": "Fresh Chives",
    "category": "vegetable",
    "defaultAmount": 100,
    "defaultUnit": "g",
    "defaultPrepState": "raw",
    "kcal": 30,
    "protein": 3.3,
    "fat": 0.7,
    "carbs": 4.4,
    "fiber": 2.5,
    "netCarbs": 1.9,
    "glycemicIndex": 15,
    "glycemicLoad": 0.3,
    "isUserAuthored": false
  },
  {
    "id": "romaine-lettuce",
    "name": "Romaine Lettuce",
    "category": "vegetable",
    "defaultAmount": 100,
    "defaultUnit": "g",
    "defaultPrepState": "raw",
    "kcal": 17,
    "protein": 1.2,
    "fat": 0.3,
    "carbs": 3.3,
    "fiber": 2.1,
    "netCarbs": 1.2,
    "glycemicIndex": 15,
    "glycemicLoad": 0.2,
    "isUserAuthored": false
  },
  {
    "id": "kale",
    "name": "Lacinato Kale",
    "category": "vegetable",
    "defaultAmount": 100,
    "defaultUnit": "g",
    "defaultPrepState": "raw",
    "kcal": 49,
    "protein": 4.3,
    "fat": 0.9,
    "carbs": 8.8,
    "fiber": 3.6,
    "netCarbs": 5.2,
    "glycemicIndex": 15,
    "glycemicLoad": 0.8,
    "isUserAuthored": false
  },
  {
    "id": "cucumber",
    "name": "Persian / English Cucumber",
    "category": "vegetable",
    "defaultAmount": 100,
    "defaultUnit": "g",
    "defaultPrepState": "raw",
    "kcal": 15,
    "protein": 0.7,
    "fat": 0.1,
    "carbs": 3.6,
    "fiber": 0.5,
    "netCarbs": 3.1,
    "glycemicIndex": 15,
    "glycemicLoad": 0.5,
    "isUserAuthored": false
  },
  {
    "id": "pumpkin-seeds",
    "name": "Raw Pumpkin Seeds (Pepitas)",
    "category": "fat",
    "defaultAmount": 100,
    "defaultUnit": "g",
    "defaultPrepState": "raw",
    "kcal": 559,
    "protein": 30.2,
    "fat": 49.1,
    "carbs": 10.7,
    "fiber": 6,
    "netCarbs": 4.7,
    "glycemicIndex": 15,
    "glycemicLoad": 0.7,
    "isUserAuthored": false
  },
  {
    "id": "garlic",
    "name": "Fresh Garlic",
    "category": "seasoning",
    "defaultAmount": 100,
    "defaultUnit": "g",
    "defaultPrepState": "raw",
    "kcal": 149,
    "protein": 6.4,
    "fat": 0.5,
    "carbs": 33.1,
    "fiber": 2.1,
    "netCarbs": 31,
    "glycemicIndex": 30,
    "glycemicLoad": 9.3,
    "isUserAuthored": false
  },
  {
    "id": "wild-salmon",
    "name": "Wild Pink Salmon",
    "category": "protein",
    "defaultAmount": 100,
    "defaultUnit": "g",
    "defaultPrepState": "raw",
    "kcal": 142,
    "protein": 20,
    "fat": 6.3,
    "carbs": 0,
    "fiber": 0,
    "netCarbs": 0,
    "glycemicIndex": 0,
    "glycemicLoad": 0,
    "isUserAuthored": false
  },
  {
    "id": "red-onion",
    "name": "Red Onion",
    "category": "vegetable",
    "defaultAmount": 100,
    "defaultUnit": "g",
    "defaultPrepState": "raw",
    "kcal": 40,
    "protein": 1.1,
    "fat": 0.1,
    "carbs": 9.3,
    "fiber": 1.7,
    "netCarbs": 7.6,
    "glycemicIndex": 15,
    "glycemicLoad": 1.1,
    "isUserAuthored": false
  },
  {
    "id": "dill",
    "name": "Fresh Dill",
    "category": "seasoning",
    "defaultAmount": 100,
    "defaultUnit": "g",
    "defaultPrepState": "raw",
    "kcal": 43,
    "protein": 3.5,
    "fat": 1.1,
    "carbs": 7,
    "fiber": 2.1,
    "netCarbs": 4.9,
    "glycemicIndex": 15,
    "glycemicLoad": 0.7,
    "isUserAuthored": false
  },
  {
    "id": "capers",
    "name": "Capers",
    "category": "seasoning",
    "defaultAmount": 100,
    "defaultUnit": "g",
    "defaultPrepState": "raw",
    "kcal": 23,
    "protein": 2.4,
    "fat": 0.9,
    "carbs": 4.9,
    "fiber": 3.2,
    "netCarbs": 1.7,
    "glycemicIndex": 15,
    "glycemicLoad": 0.3,
    "isUserAuthored": false
  },
  {
    "id": "sea-bass",
    "name": "Sea Bass Fillet",
    "category": "protein",
    "defaultAmount": 100,
    "defaultUnit": "g",
    "defaultPrepState": "raw",
    "kcal": 124,
    "protein": 23.4,
    "fat": 2.6,
    "carbs": 0,
    "fiber": 0,
    "netCarbs": 0,
    "glycemicIndex": 0,
    "glycemicLoad": 0,
    "isUserAuthored": false
  },
  {
    "id": "baby-bok-choy",
    "name": "Baby Bok Choy",
    "category": "vegetable",
    "defaultAmount": 100,
    "defaultUnit": "g",
    "defaultPrepState": "raw",
    "kcal": 13,
    "protein": 1.5,
    "fat": 0.2,
    "carbs": 2.2,
    "fiber": 1,
    "netCarbs": 1.2,
    "glycemicIndex": 15,
    "glycemicLoad": 0.2,
    "isUserAuthored": false
  },
  {
    "id": "ginger",
    "name": "Fresh Ginger Root",
    "category": "seasoning",
    "defaultAmount": 100,
    "defaultUnit": "g",
    "defaultPrepState": "raw",
    "kcal": 80,
    "protein": 1.8,
    "fat": 0.8,
    "carbs": 17.8,
    "fiber": 2,
    "netCarbs": 15.8,
    "glycemicIndex": 15,
    "glycemicLoad": 2.4,
    "isUserAuthored": false
  },
  {
    "id": "scallions",
    "name": "Scallions / Green Onions",
    "category": "vegetable",
    "defaultAmount": 100,
    "defaultUnit": "g",
    "defaultPrepState": "raw",
    "kcal": 32,
    "protein": 1.8,
    "fat": 0.2,
    "carbs": 7.3,
    "fiber": 2.6,
    "netCarbs": 4.7,
    "glycemicIndex": 15,
    "glycemicLoad": 0.7,
    "isUserAuthored": false
  },
  {
    "id": "tamari-soy-sauce",
    "name": "Tamari Soy Sauce",
    "category": "seasoning",
    "defaultAmount": 100,
    "defaultUnit": "g",
    "defaultPrepState": "raw",
    "kcal": 60,
    "protein": 10.5,
    "fat": 0.1,
    "carbs": 5.4,
    "fiber": 0,
    "netCarbs": 5.4,
    "glycemicIndex": 15,
    "glycemicLoad": 0.8,
    "isUserAuthored": false
  },
  {
    "id": "cabbage",
    "name": "Red & Green Cabbage",
    "category": "vegetable",
    "defaultAmount": 100,
    "defaultUnit": "g",
    "defaultPrepState": "raw",
    "kcal": 25,
    "protein": 1.3,
    "fat": 0.1,
    "carbs": 5.8,
    "fiber": 2.5,
    "netCarbs": 3.3,
    "glycemicIndex": 15,
    "glycemicLoad": 0.5,
    "isUserAuthored": false
  },
  {
    "id": "peanuts",
    "name": "Roasted Peanuts",
    "category": "legume",
    "defaultAmount": 100,
    "defaultUnit": "g",
    "defaultPrepState": "roasted",
    "kcal": 567,
    "protein": 25.8,
    "fat": 49.2,
    "carbs": 16.1,
    "fiber": 8.5,
    "netCarbs": 7.6,
    "glycemicIndex": 14,
    "glycemicLoad": 1.1,
    "isUserAuthored": false
  },
  {
    "id": "tuna-light",
    "name": "Canned Light Tuna",
    "category": "protein",
    "defaultAmount": 100,
    "defaultUnit": "g",
    "defaultPrepState": "raw",
    "kcal": 116,
    "protein": 26,
    "fat": 1,
    "carbs": 0,
    "fiber": 0,
    "netCarbs": 0,
    "glycemicIndex": 0,
    "glycemicLoad": 0,
    "isUserAuthored": false
  },
  {
    "id": "green-beans",
    "name": "Haricots Verts / Green Beans",
    "category": "vegetable",
    "defaultAmount": 100,
    "defaultUnit": "g",
    "defaultPrepState": "raw",
    "kcal": 31,
    "protein": 1.8,
    "fat": 0.2,
    "carbs": 7,
    "fiber": 2.7,
    "netCarbs": 4.3,
    "glycemicIndex": 15,
    "glycemicLoad": 0.6,
    "isUserAuthored": false
  },
  {
    "id": "cherry-tomato",
    "name": "Cherry Tomatoes",
    "category": "vegetable",
    "defaultAmount": 100,
    "defaultUnit": "g",
    "defaultPrepState": "raw",
    "kcal": 18,
    "protein": 0.9,
    "fat": 0.2,
    "carbs": 3.9,
    "fiber": 1.2,
    "netCarbs": 2.7,
    "glycemicIndex": 15,
    "glycemicLoad": 0.4,
    "isUserAuthored": false
  },
  {
    "id": "kalamata-olives",
    "name": "Kalamata Olives",
    "category": "fat",
    "defaultAmount": 100,
    "defaultUnit": "g",
    "defaultPrepState": "raw",
    "kcal": 240,
    "protein": 1,
    "fat": 25,
    "carbs": 3,
    "fiber": 3,
    "netCarbs": 0,
    "glycemicIndex": 15,
    "glycemicLoad": 0,
    "isUserAuthored": false
  },
  {
    "id": "tofu-extra-firm",
    "name": "Extra-Firm Organic Tofu",
    "category": "protein",
    "defaultAmount": 100,
    "defaultUnit": "g",
    "defaultPrepState": "raw",
    "kcal": 83,
    "protein": 10,
    "fat": 5,
    "carbs": 1.5,
    "fiber": 1,
    "netCarbs": 0.5,
    "glycemicIndex": 15,
    "glycemicLoad": 0.1,
    "isUserAuthored": false
  },
  {
    "id": "carrots",
    "name": "Carrots",
    "category": "vegetable",
    "defaultAmount": 100,
    "defaultUnit": "g",
    "defaultPrepState": "raw",
    "kcal": 41,
    "protein": 0.9,
    "fat": 0.2,
    "carbs": 9.6,
    "fiber": 2.8,
    "netCarbs": 6.8,
    "glycemicIndex": 39,
    "glycemicLoad": 2.7,
    "isUserAuthored": false
  },
  {
    "id": "bell-pepper-red",
    "name": "Red Bell Pepper",
    "category": "vegetable",
    "defaultAmount": 100,
    "defaultUnit": "g",
    "defaultPrepState": "raw",
    "kcal": 31,
    "protein": 1,
    "fat": 0.3,
    "carbs": 6,
    "fiber": 2.1,
    "netCarbs": 3.9,
    "glycemicIndex": 15,
    "glycemicLoad": 0.6,
    "isUserAuthored": false
  },
  {
    "id": "bell-pepper-yellow",
    "name": "Yellow Bell Pepper",
    "category": "vegetable",
    "defaultAmount": 100,
    "defaultUnit": "g",
    "defaultPrepState": "raw",
    "kcal": 27,
    "protein": 1,
    "fat": 0.2,
    "carbs": 6.3,
    "fiber": 1.7,
    "netCarbs": 4.6,
    "glycemicIndex": 15,
    "glycemicLoad": 0.7,
    "isUserAuthored": false
  },
  {
    "id": "bell-pepper",
    "name": "Bell Pepper",
    "category": "vegetable",
    "defaultAmount": 100,
    "defaultUnit": "g",
    "defaultPrepState": "raw",
    "kcal": 26,
    "protein": 1,
    "fat": 0.3,
    "carbs": 6,
    "fiber": 2.1,
    "netCarbs": 3.9,
    "glycemicIndex": 15,
    "glycemicLoad": 0.6,
    "isUserAuthored": false
  },
  {
    "id": "sugar-snap-peas",
    "name": "Sugar Snap Peas",
    "category": "vegetable",
    "defaultAmount": 100,
    "defaultUnit": "g",
    "defaultPrepState": "raw",
    "kcal": 42,
    "protein": 2.8,
    "fat": 0.2,
    "carbs": 7.5,
    "fiber": 2.6,
    "netCarbs": 4.9,
    "glycemicIndex": 15,
    "glycemicLoad": 0.7,
    "isUserAuthored": false
  },
  {
    "id": "cremini-mushrooms",
    "name": "Cremini / Button Mushrooms",
    "category": "vegetable",
    "defaultAmount": 100,
    "defaultUnit": "g",
    "defaultPrepState": "raw",
    "kcal": 22,
    "protein": 2.5,
    "fat": 0.1,
    "carbs": 4.3,
    "fiber": 1.5,
    "netCarbs": 2.8,
    "glycemicIndex": 15,
    "glycemicLoad": 0.4,
    "isUserAuthored": false
  },
  {
    "id": "almonds-flaked",
    "name": "Toasted Flaked Almonds",
    "category": "legume",
    "defaultAmount": 100,
    "defaultUnit": "g",
    "defaultPrepState": "roasted",
    "kcal": 579,
    "protein": 21.2,
    "fat": 49.9,
    "carbs": 21.6,
    "fiber": 12.5,
    "netCarbs": 9.1,
    "glycemicIndex": 15,
    "glycemicLoad": 1.4,
    "isUserAuthored": false
  },
  {
    "id": "cannellini-beans",
    "name": "Cannellini White Beans (Cooked)",
    "category": "legume",
    "defaultAmount": 100,
    "defaultUnit": "g",
    "defaultPrepState": "boiled",
    "kcal": 139,
    "protein": 9.7,
    "fat": 0.5,
    "carbs": 25.1,
    "fiber": 6.3,
    "netCarbs": 18.8,
    "glycemicIndex": 31,
    "glycemicLoad": 5.8,
    "isUserAuthored": false
  },
  {
    "id": "feta-cheese",
    "name": "Greek Sheep's Milk Feta",
    "category": "cheese",
    "defaultAmount": 100,
    "defaultUnit": "g",
    "defaultPrepState": "raw",
    "kcal": 264,
    "protein": 14.2,
    "fat": 21.3,
    "carbs": 4.1,
    "fiber": 0,
    "netCarbs": 4.1,
    "glycemicIndex": 0,
    "glycemicLoad": 0,
    "isUserAuthored": false
  },
  {
    "id": "asparagus",
    "name": "Green Asparagus",
    "category": "vegetable",
    "defaultAmount": 100,
    "defaultUnit": "g",
    "defaultPrepState": "raw",
    "kcal": 20,
    "protein": 2.2,
    "fat": 0.1,
    "carbs": 3.9,
    "fiber": 2.1,
    "netCarbs": 1.8,
    "glycemicIndex": 15,
    "glycemicLoad": 0.3,
    "isUserAuthored": false
  },
  {
    "id": "ground-pork-lean",
    "name": "Lean Minced Pork/Turkey (7-10% fat)",
    "category": "protein",
    "defaultAmount": 100,
    "defaultUnit": "g",
    "defaultPrepState": "raw",
    "kcal": 172,
    "protein": 23,
    "fat": 8.5,
    "carbs": 0,
    "fiber": 0,
    "netCarbs": 0,
    "glycemicIndex": 0,
    "glycemicLoad": 0,
    "isUserAuthored": false
  },
  {
    "id": "rolled-oats",
    "name": "Rolled Oats",
    "category": "grain",
    "defaultAmount": 100,
    "defaultUnit": "g",
    "defaultPrepState": "raw",
    "kcal": 379,
    "protein": 13.2,
    "fat": 6.5,
    "carbs": 67.7,
    "fiber": 10.1,
    "netCarbs": 57.6,
    "glycemicIndex": 55,
    "glycemicLoad": 31.7,
    "isUserAuthored": false
  },
  {
    "id": "ground-beef-lean",
    "name": "Extra-Lean Ground Beef (5% fat)",
    "category": "protein",
    "defaultAmount": 100,
    "defaultUnit": "g",
    "defaultPrepState": "raw",
    "kcal": 137,
    "protein": 21.4,
    "fat": 5,
    "carbs": 0,
    "fiber": 0,
    "netCarbs": 0,
    "glycemicIndex": 0,
    "glycemicLoad": 0,
    "isUserAuthored": false
  },
  {
    "id": "black-beans",
    "name": "Canned Black Beans (Cooked)",
    "category": "legume",
    "defaultAmount": 100,
    "defaultUnit": "g",
    "defaultPrepState": "boiled",
    "kcal": 132,
    "protein": 8.9,
    "fat": 0.5,
    "carbs": 23.7,
    "fiber": 8.7,
    "netCarbs": 15,
    "glycemicIndex": 30,
    "glycemicLoad": 4.5,
    "isUserAuthored": false
  },
  {
    "id": "red-kidney-beans",
    "name": "Canned Red Kidney Beans",
    "category": "legume",
    "defaultAmount": 100,
    "defaultUnit": "g",
    "defaultPrepState": "boiled",
    "kcal": 127,
    "protein": 8.7,
    "fat": 0.5,
    "carbs": 22.8,
    "fiber": 6.4,
    "netCarbs": 16.4,
    "glycemicIndex": 24,
    "glycemicLoad": 3.9,
    "isUserAuthored": false
  },
  {
    "id": "canned-tomatoes",
    "name": "Crushed Italian Canned Tomatoes",
    "category": "vegetable",
    "defaultAmount": 100,
    "defaultUnit": "g",
    "defaultPrepState": "raw",
    "kcal": 32,
    "protein": 1.6,
    "fat": 0.3,
    "carbs": 7.3,
    "fiber": 1.9,
    "netCarbs": 5.4,
    "glycemicIndex": 30,
    "glycemicLoad": 1.6,
    "isUserAuthored": false
  },
  {
    "id": "chickpeas",
    "name": "Cooked Chickpeas",
    "category": "legume",
    "defaultAmount": 100,
    "defaultUnit": "g",
    "defaultPrepState": "boiled",
    "kcal": 164,
    "protein": 8.9,
    "fat": 2.6,
    "carbs": 27.4,
    "fiber": 7.6,
    "netCarbs": 19.8,
    "glycemicIndex": 28,
    "glycemicLoad": 5.5,
    "isUserAuthored": false
  },
  {
    "id": "yellow-onion",
    "name": "Yellow Onion",
    "category": "vegetable",
    "defaultAmount": 100,
    "defaultUnit": "g",
    "defaultPrepState": "raw",
    "kcal": 40,
    "protein": 1.1,
    "fat": 0.1,
    "carbs": 9.3,
    "fiber": 1.7,
    "netCarbs": 7.6,
    "glycemicIndex": 15,
    "glycemicLoad": 1.1,
    "isUserAuthored": false
  },
  {
    "id": "sirloin-steak",
    "name": "Lean Top Sirloin Steak",
    "category": "protein",
    "defaultAmount": 100,
    "defaultUnit": "g",
    "defaultPrepState": "raw",
    "kcal": 183,
    "protein": 30.6,
    "fat": 6.8,
    "carbs": 0,
    "fiber": 0,
    "netCarbs": 0,
    "glycemicIndex": 0,
    "glycemicLoad": 0,
    "isUserAuthored": false
  },
  {
    "id": "kimchi",
    "name": "Probiotic Kimchi",
    "category": "vegetable",
    "defaultAmount": 100,
    "defaultUnit": "g",
    "defaultPrepState": "raw",
    "kcal": 15,
    "protein": 1.1,
    "fat": 0.5,
    "carbs": 2.4,
    "fiber": 1.6,
    "netCarbs": 0.8,
    "glycemicIndex": 15,
    "glycemicLoad": 0.1,
    "isUserAuthored": false
  },
  {
    "id": "whole-grain-farro",
    "name": "Whole-Grain Farro (Cooked)",
    "category": "grain",
    "defaultAmount": 100,
    "defaultUnit": "g",
    "defaultPrepState": "boiled",
    "kcal": 150,
    "protein": 6,
    "fat": 1,
    "carbs": 32,
    "fiber": 5,
    "netCarbs": 27,
    "glycemicIndex": 40,
    "glycemicLoad": 10.8,
    "isUserAuthored": false
  },
  {
    "id": "brown-basmati-rice",
    "name": "Cooked Brown Basmati Rice",
    "category": "grain",
    "defaultAmount": 100,
    "defaultUnit": "g",
    "defaultPrepState": "boiled",
    "kcal": 121,
    "protein": 2.7,
    "fat": 0.9,
    "carbs": 25.6,
    "fiber": 1.8,
    "netCarbs": 23.8,
    "glycemicIndex": 50,
    "glycemicLoad": 11.9,
    "isUserAuthored": false
  }
];

// Module-level in-memory cache populated from Strapi
let _registryCache = DEFAULT_SEED_INGREDIENTS.map(normalizeIngredient);

export function isSystemIngredient(id) {
  const ing = getIngredientById(id);
  return ing ? !ing.isUserAuthored : false;
}

export function isCustomIngredient(id) {
  return typeof id === 'string' && (id.startsWith(CUSTOM_ID_PREFIX) || !isNaN(Number(id)));
}

export function generateCustomId(name) {
  const slug = (name || 'ingredient')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
  return `${CUSTOM_ID_PREFIX}${slug}-${Date.now()}`;
}

export function getSystemIngredients() {
  const registry = getIngredientsRegistry();
  return registry.filter(i => !i.isUserAuthored);
}

/**
 * Returns the ingredient registry directly from Strapi CMS `/api/ingredients`.
 * @returns {Promise<Array<object>>}
 */
export async function getIngredientsRegistryAsync() {
  try {
    const response = await strapiGet(COLLECTION, { 'pagination[limit]': '500' });
    const list = Array.isArray(response) ? response : (response?.data ?? []);

    if (list.length > 0) {
      _registryCache = list.map(normalizeIngredient);
    }
    return _registryCache;
  } catch (err) {
    console.error('[ingredientStore] Strapi /api/ingredients fetch failed:', err.message);
    return _registryCache;
  }
}

/**
 * Synchronous getter — returns cached registry or seed default.
 * @returns {Array<object>}
 */
export function getIngredientsRegistry() {
  if (!_registryCache || _registryCache.length === 0) {
    _registryCache = DEFAULT_SEED_INGREDIENTS.map(normalizeIngredient);
  }
  return _registryCache;
}

/**
 * Look up ingredient by ID or name in the cached Strapi registry.
 * @param {string|number} id
 * @returns {object|null}
 */
export function getIngredientById(id) {
  if (!id && id !== 0) return null;
  const strId = String(id);
  const registry = getIngredientsRegistry();
  return registry.find(
    (i) => String(i.id) === strId || i.name?.toLowerCase() === strId.toLowerCase()
  ) || null;
}

export function getCustomIngredients(userId = null) {
  const registry = getIngredientsRegistry() || [];
  return registry.filter((i) => {
    if (!i.isUserAuthored) return false;
    const itemOwner = i.owner?.id ?? i.owner ?? i.userId ?? i.ownerId ?? null;
    if (!itemOwner) return true;
    if (!userId) return false;
    return String(itemOwner) === String(userId);
  });
}

function normalizeIngredient(raw) {
  const carbs = parseFloat(raw?.carbs ?? raw?.nutrition?.carbs) || 0;
  const fiber = parseFloat(raw?.fiber ?? raw?.nutrition?.fiber) || 0;
  const netCarbs = raw?.netCarbs !== undefined && raw?.netCarbs !== null
    ? parseFloat(raw.netCarbs)
    : Math.max(0, Math.round((carbs - fiber) * 10) / 10);

  const gi = _parseNullableNumber(raw?.glycemicIndex ?? raw?.nutrition?.glycemicIndex);
  const gl = raw?.glycemicLoad !== undefined && raw?.glycemicLoad !== null
    ? _parseNullableNumber(raw.glycemicLoad)
    : (gi !== null ? Math.round((gi * netCarbs) / 100 * 10) / 10 : null);

  return {
    id: String(raw?.id ?? raw?.documentId ?? ''),
    name: raw?.name ?? '',
    category: raw?.category ?? '',
    defaultUnit: raw?.defaultUnit ?? 'g',
    defaultAmount: parseFloat(raw?.defaultAmount) || 100,
    isUserAuthored: raw?.isUserAuthored ?? true,
    owner: raw?.owner?.id ?? raw?.owner ?? raw?.userId ?? raw?.ownerId ?? null,
    createdAt: raw?.createdAt ?? null,
    updatedAt: raw?.updatedAt ?? null,
    defaultPrepState: raw?.defaultPrepState ?? 'raw',
    substitutions: Array.isArray(raw?.substitutions) ? raw.substitutions : [],
    kcal: parseFloat(raw?.kcal ?? raw?.nutrition?.kcal) || 0,
    protein: parseFloat(raw?.protein ?? raw?.nutrition?.protein) || 0,
    fat: parseFloat(raw?.fat ?? raw?.nutrition?.fat) || 0,
    carbs,
    fiber,
    netCarbs,
    glycemicIndex: gi,
    glycemicLoad: gl,
    nutrition: {
      kcal: parseFloat(raw?.kcal ?? raw?.nutrition?.kcal) || 0,
      protein: parseFloat(raw?.protein ?? raw?.nutrition?.protein) || 0,
      fat: parseFloat(raw?.fat ?? raw?.nutrition?.fat) || 0,
      carbs,
      fiber,
      netCarbs,
      glycemicIndex: gi,
      glycemicLoad: gl,
    },
  };
}

function _parseNullableNumber(val) {
  if (val === null || val === undefined || val === '') return null;
  const n = parseFloat(val);
  return isNaN(n) ? null : n;
}

export function validateCustomIngredient(input) {
  const errors = [];

  if (!input.name || typeof input.name !== 'string' || input.name.trim().length === 0) {
    errors.push('Name is required.');
  } else if (input.name.trim().length > 80) {
    errors.push('Name must be 80 characters or fewer.');
  }

  if (!input.category || !VALID_CATEGORIES.includes(input.category)) {
    errors.push(`Category must be one of: ${VALID_CATEGORIES.join(', ')}.`);
  }

  if (!input.defaultUnit || !VALID_UNITS.includes(input.defaultUnit)) {
    errors.push(`Default unit must be one of: ${VALID_UNITS.join(', ')}.`);
  }

  const amount = parseFloat(input.defaultAmount);
  if (isNaN(amount) || amount <= 0) {
    errors.push('Default amount must be a positive number.');
  }

  const requiredNutrition = ['kcal', 'protein', 'fat', 'carbs', 'fiber'];
  for (const field of requiredNutrition) {
    const val = parseFloat(input.nutrition?.[field]);
    if (isNaN(val) || val < 0) {
      errors.push(`Nutrition "${field}" must be a non-negative number.`);
    }
  }

  const carbs = parseFloat(input.nutrition?.carbs) || 0;
  const fiber = parseFloat(input.nutrition?.fiber) || 0;
  const netCarbs = carbs - fiber;
  const gi = input.nutrition?.glycemicIndex !== null && input.nutrition?.glycemicIndex !== undefined ? parseFloat(input.nutrition?.glycemicIndex) : null;
  const gl = gi !== null ? (gi * Math.max(0, netCarbs)) / 100 : 0;

  // US-3.2 Database Anomaly Detection Rules
  if (fiber > carbs) {
    errors.push('Data anomaly detected. Please check carb and fiber values.');
  }

  if (netCarbs < 0) {
    errors.push('Data anomaly detected. Please check carb and fiber values.');
  }

  if (gl > 100) {
    errors.push('Data anomaly detected. Please check carb and fiber values.');
  }

  if (gi !== null) {
    if (isNaN(gi) || gi < 0 || gi > 100) {
      errors.push('Glycemic Index must be a number between 0 and 100.');
    }
  }

  return errors.length === 0 ? { valid: true } : { valid: false, errors };
}

/**
 * Direct ingestion of custom ingredients into Strapi `/api/ingredients`.
 * On HTTP 200/201 response:
 * 1. Invalidates local ingredient selection caches.
 * 2. Refreshes registry cache.
 * 3. Returns newly created Strapi ingredient ID.
 *
 * @param {object} rawInput
 * @returns {Promise<{ ok: boolean, ingredient: object|null, errors: string[]|null, warning: string|null }>}
 */
export async function saveCustomIngredient(rawInput, ownerId = null) {
  const validation = validateCustomIngredient(rawInput);
  if (!validation.valid) {
    return { ok: false, ingredient: null, errors: validation.errors, warning: null };
  }

  const carbs = parseFloat(rawInput.nutrition.carbs) || 0;
  const fiber = parseFloat(rawInput.nutrition.fiber) || 0;
  const giRaw = rawInput.nutrition.glycemicIndex;
  const gi = (giRaw !== null && giRaw !== undefined && giRaw !== '') ? parseFloat(giRaw) : null;
  const netCarbs = Math.max(0, Math.round((carbs - fiber) * 10) / 10);
  const glycemicLoad = gi !== null ? Math.round((gi * netCarbs) / 100 * 10) / 10 : null;

  const normalizedInputName = rawInput.name.trim().toLowerCase();
  let warning = null;
  const registry = getIngredientsRegistry();
  const existingMatch = registry.find(ing => ing.name.toLowerCase() === normalizedInputName);
  if (existingMatch && !existingMatch.isUserAuthored) {
    warning = 'similar_to_system';
  }

  const resolvedOwner = ownerId ?? rawInput.ownerId ?? rawInput.owner ?? null;

  const payload = {
    name: rawInput.name.trim().replace(/\s+/g, ' '),
    category: rawInput.category,
    defaultUnit: rawInput.defaultUnit,
    defaultAmount: parseFloat(rawInput.defaultAmount),
    isUserAuthored: true,
    owner: resolvedOwner,
    kcal: parseFloat(rawInput.nutrition.kcal) || 0,
    protein: parseFloat(rawInput.nutrition.protein) || 0,
    fat: parseFloat(rawInput.nutrition.fat) || 0,
    carbs,
    fiber,
    netCarbs,
    glycemicIndex: gi,
    glycemicLoad,
  };

  try {
    const response = await strapiPost(COLLECTION, payload);
    const normalized = normalizeIngredient({ ...response, owner: resolvedOwner });

    const registry = getIngredientsRegistry();
    const existingIdx = registry.findIndex((i) => String(i.id) === String(normalized.id));
    if (existingIdx >= 0) {
      registry[existingIdx] = normalized;
    } else {
      registry.push(normalized);
    }

    return { ok: true, ingredient: normalized, errors: null, warning };
  } catch (err) {
    console.error('[ingredientStore] Strapi POST /api/ingredients failed:', err.message);
    return { ok: false, ingredient: null, errors: [err.message || 'Failed to save ingredient to Strapi CMS.'], warning: null };
  }
}

export function deleteCustomIngredient(id) {
  invalidateIngredientCache();
  return { ok: true };
}

export function setRegistryCache(items) {
  _registryCache = items;
}

export function invalidateIngredientCache() {
  _registryCache = null;
  invalidateCache('ingredients');
}
