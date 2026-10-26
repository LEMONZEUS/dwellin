// Demo account and sample content. Nothing here talks to a server.
export const DEMO_USER = {
  name: "Joy Stephen Mudaliar",
  email: "demo@dwellin.app",
  password: "dwellin123",
  unit: "1701",
  phone: "+1 (416) 555-0142",
  contactEmail: "joy.mudaliar@example.com",
};

export const BUILDING = { name: "The Meridian", address: "88 Harbour Street" };

// AMENITY IMAGES: each `image` is a file inside the /public folder.
// To use your own photo, copy it into public/images/amenities/ and change the path below
// (for example "images/amenities/my-gym.jpg"). Landscape images around 800x480 look best.
export const AMENITIES = [
  {
    id: "conference",
    name: "Conference Room",
    blurb: "Seats 10. Screen and whiteboard included.",
    image: "images/amenities/Conference Room.jpeg",
    alt: "Conference room with a long table and a wall screen",
    open: 8 * 60,
    close: 21 * 60,
  },
  {
    id: "gym",
    name: "Gym",
    blurb: "Cardio, free weights and a stretching area.",
    image: "images/amenities/Gym.jpeg",
    alt: "Gym with a treadmill, dumbbell rack and bench",
    open: 5 * 60,
    close: 23 * 60,
  },
  {
    id: "game-room",
    name: "Game Room",
    blurb: "Pool table, foosball and arcade games. Seats 12.",
    image: "images/amenities/game-room.jpg",
    alt: "Game room with a pool table and arcade games",
    open: 10 * 60,
    close: 23 * 60,
  },
  {
    id: "theatre",
    name: "Theatre Room",
    blurb: "Private screening room with 14 recliners and surround sound.",
    image: "images/amenities/theatre-room.png",
    alt: "Theatre room with rows of recliners and a large screen",
    open: 12 * 60,
    close: 23 * 60,
  },
  {
    id: "golf-simulator",
    name: "Golf Simulator",
    blurb: "Indoor simulator with 40 courses. Clubs at the front desk.",
    image: "images/amenities/golf-simulator.jpg",
    alt: "Indoor golf simulator with a screen and a hitting mat",
    open: 8 * 60,
    close: 22 * 60,
  },
];

export const POSTS = [
  {
    id: "p1",
    title: "Elevator B maintenance",
    when: "Tuesday, 9:00 am to 1:00 pm",
    body: "Elevator B will be out of service while the cab is serviced. Please use Elevator A or the stairs.",
    tag: "Maintenance",
  },
  {
    id: "p2",
    title: "Rooftop movie night",
    when: "Friday, 8:00 pm",
    body: "Bring a blanket. Popcorn and hot drinks are provided by the community team. Weather permitting.",
    tag: "Event",
  },
  {
    id: "p3",
    title: "Fire alarm testing",
    when: "Next Wednesday, 10:00 am",
    body: "Each floor will be tested for about 15 minutes. No action is needed unless the alarm is sustained.",
    tag: "Safety",
  },
];

export const TERMS = [
  "These terms are sample text for a concept project and do not form a legal agreement.",
  "Residents agree to use shared amenities considerately and follow the posted rules.",
  "Reservations can be cancelled up to two hours before the booked time.",
  "The community team may update building announcements at any time.",
];

export const PRIVACY = [
  "This is sample text for a concept project.",
  "Dwellin stores your name, unit and contact details so the community team can reach you.",
  "Contact details are hidden by default and shown only when you choose Reveal.",
  "You can delete your account at any time from My Profile.",
];
