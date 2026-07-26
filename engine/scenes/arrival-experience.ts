export interface ArrivalExperience {
  id: string;
  headline: string;
  message: string;
  transition: "fade";
  displayOnce: true;
}

export const FIRST_ARRIVAL_EXPERIENCE: ArrivalExperience = {
  id: "first-arrival",
  headline: "Welcome, Traveler.",
  message: "The road has been waiting for you.",
  transition: "fade",
  displayOnce: true
};
