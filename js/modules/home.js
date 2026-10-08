import { mountPublicView } from "../services/views.js";

export async function renderHome() {
  await mountPublicView("views/home.html");
}
