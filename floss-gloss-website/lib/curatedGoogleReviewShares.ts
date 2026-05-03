/**
 * Office-approved excerpts attributed to named reviewers (initials shown as avatars).
 * `shareUrl` is optional per slide; the slider falls back to the main Google listing link.
 */
export type CuratedGoogleShareSlide = {
  id: string;
  authorName: string;
  excerpt: string;
  shareUrl?: string;
};

export const CURATED_GOOGLE_REVIEW_SHARES: CuratedGoogleShareSlide[] = [
  {
    id: "daniyaal-taherali",
    authorName: "Daniyaal Taherali",
    excerpt:
      "This is a good, reliable dental practice. The office is clean and modern. Dr. Taher is a skilled and professional dentist who does quality work. The staff is friendly and efficient. I would recommend this office for your dental care.",
  },
  {
    id: "hygiene-visit",
    authorName: "Patient · hygiene",
    excerpt:
      "I've had the best experience at floss and glass and I absolutely love the way Farah cleaned my teeth!! I've had some bad experiences in the past and I was so scared to get my teeth clean but Farah made me feel so comfortable and did an amazing job. She is my forever go-to person now.",
  },
  {
    id: "family-five-years",
    authorName: "Parent · family care",
    excerpt:
      "The whole team at Floss and Gloss is amazing and very professional. Switched my family to this place 5 years ago and never looked back. Super clean, super professional. Zero issues. My 7 and 3 year old love going to the dentist!",
  },
  {
    id: "farah-dr-taher",
    authorName: "Patient · urgent care",
    excerpt:
      "10 stars for Farah! Wonderful service!! Dr. Taher Ali was extremely gracious enough to fit me into his busy schedule to address a toothache. And the front desk staff are EXTREMELY nice! If I lived in Canada, I would definitely have Floss & Gloss be my dental care provider!",
  },
  {
    id: "ferzin-bulsara",
    authorName: "Ferzin Bulsara",
    excerpt:
      "From the moment you walk into this clinic, you know you are in the right place. The experience is exceptional from start to finish. The receptionists, Rose and Zahra, are incredibly friendly and welcoming, instantly putting you at ease.",
  },
  {
    id: "sammi-brown",
    authorName: "Sammi Brown",
    excerpt:
      "I had just moved to the area, and I was looking for a dental office when I came across Floss & Gloss Dentistry. It was a no-brainer from the reviews to the phone call that I had with Rose. I knew this was my new dental office.",
  },
  {
    id: "marie-victoria-de-vera",
    authorName: "Marie-Victoria de Vera",
    excerpt:
      "After bringing my 4yo daughter to a Pediatric dentist in Brampton close to home for her first visit and having a horrible experience, I was recommend to floss and gloss by a friend who takes her kids and family here.",
  },
  {
    id: "tom-nguyen",
    authorName: "Tom Nguyen",
    excerpt:
      "Had an issue with my lingual bar they booked me in right away and it got looked at and sorted out. I appreciate how I was given options for my situations and what I should do moving forward with my teeth. Very happy with the staff service and kind people who are at this practice.",
  },
  {
    id: "siddharth-ahluwalia",
    authorName: "Siddharth Ahluwalia",
    excerpt:
      "Experienced staff very friendly and informative service was amazing was in n out for a cleaning … will be back …. Definitely recommend for all ur dental work ….",
  },
  {
    id: "justin-r-nolette",
    authorName: "Justin R.-Nolette",
    excerpt:
      "Absolutely amazing experience here! It's been an extremely long time since I was at the dentist and I was a bit nervous at what they might find wrong with my teeth... but from the beginning of intake, to the assessment, to the cleaning, they made it easy.",
  },
  {
    id: "fathima-shaha",
    authorName: "Fathima Shaha",
    excerpt:
      "I can highly recommended Floss and Gloss for everyone. I am and my family have been going to Floss and Gloss for over 4 years. The staff is very professional and very helpful, amazing. I would like to thanks Dr. Ali, Mrs. Ross, Mrs. Farah, all the employees at Floss and Gloss. I can give five stars for Floss and Gloss.",
  },
  {
    id: "stefan-grimaldi",
    authorName: "Stefan Grimaldi",
    excerpt:
      "Floss & Gloss time and time again does a fantastic job with teeth cleaning and whitening. Farah, Melissa, Rose and the entire team are super kind and welcoming. Highly recommend if you are looking for a new dental hygienist or dentist.",
  },
];
