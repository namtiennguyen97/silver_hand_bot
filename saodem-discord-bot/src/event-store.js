import fs from "node:fs";
import { eventsPath } from "./paths.js";

export function loadEvents() {
    const raw = fs.readFileSync(eventsPath, "utf8");
    return JSON.parse(raw);
}

export function saveEvents(events) {
    fs.writeFileSync(eventsPath, `${JSON.stringify(events, null, 2)}\n`, "utf8");
}

export function findEvent(events, eventId) {
    return events.find(event => event.id === eventId);
}

export function setEventEnabled(eventId, enabled) {
    const events = loadEvents();
    const event = findEvent(events, eventId);
    if (!event) return null;

    event.enabled = enabled;
    saveEvents(events);
    return event;
}

export function eventChoices() {
    return loadEvents().map(event => ({
        name: event.name,
        value: event.id,
    }));
}
