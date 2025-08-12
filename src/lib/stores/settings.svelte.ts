import { getAllSettings } from "$lib/services/settingsService";

export const settings =$state(await getAllSettings()) 