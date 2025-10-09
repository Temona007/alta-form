import Airtable from "airtable";

// SP Calcs:
// const API_KEY = 'keyTFnrOIUfJgvQKL';
// const BASE_ID = 'appn1KYB11PwcypMF';

// Alta
const API_KEY = 'patZiPlJGizFyIPJe.42da4a63f4f96ef4fdba9cb56ee401928362e6d606be4aeeefc2ec4f8d41dd32';
const BASE_ID = 'appjbQOW2dsKNYgUY';
// token patZiPlJGizFyIPJe.42da4a63f4f96ef4fdba9cb56ee401928362e6d606be4aeeefc2ec4f8d41dd32
const base    = new Airtable({apiKey: API_KEY}).base(BASE_ID);

export default base;