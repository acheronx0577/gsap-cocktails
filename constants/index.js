const navLinks = [
 {
	id: "cocktails",
	title: "Cocktails",
 },
 {
	id: "about",
	title: "About Us",
 },
 {
	id: "art",
	title: "The Art",
 },
 {
	id: "contact",
	title: "Contact",
 },
];

const cocktailLists = [
 {
	name: "Chapel Hill Shiraz",
	country: "AU",
	detail: "Bottle",
	price: "$48",
 },
 {
	name: "Catena Malbec",
	country: "AU",
	detail: "Bottle",
	price: "$52",
 },
 {
	name: "Rhino Pale Ale",
	country: "CA",
	detail: "750 ml",
	price: "$20",
 },
 {
	name: "Irish Guinness",
	country: "IE",
	detail: "600 ml",
	price: "$29",
 },
];

const mockTailLists = [
 {
	name: "Tropical Bloom",
	country: "US",
	detail: "Glass",
	price: "$12",
 },
 {
	name: "Passionfruit Mint",
	country: "US",
	detail: "Glass",
	price: "$14",
 },
 {
	name: "Citrus Glow",
	country: "CA",
	detail: "Glass",
	price: "$13",
 },
 {
	name: "Lavender Fizz",
	country: "IE",
	detail: "Glass",
	price: "$15",
 },
];

const featureLists = [
 "Perfectly balanced blends",
 "Garnished to perfection",
 "Ice-cold every time",
 "Expertly shaken & stirred",
];

const goodLists = [
 "Handpicked ingredients",
 "Signature techniques",
 "Bartending artistry in action",
 "Freshly muddled flavors",
];

const openingHours = [
 { day: "Mon–Thu", time: "11:00am – 12am" },
 { day: "Fri", time: "11:00am – 2am" },
 { day: "Sat", time: "9:00am – 2am" },
 { day: "Sun", time: "9:00am – 1am" },
];

const barPhone = "(012) 345-6789";
const barEmail = "hello@velvetpour.com";
const barAddress = "1287 Ember Lane, Suite 12, Portland, OR 97209";

const socials = [
 {
	name: "Instagram",
	icon: "/images/insta.png",
	url: "#",
 },
 {
	name: "X (Twitter)",
	icon: "/images/x.png",
	url: "#",
 },
 {
	name: "Facebook",
	icon: "/images/fb.png",
	url: "#",
 },
];

const allCocktails = [
 {
	id: 1,
	name: "Classic Mojito",
	image: "/images/drink1.png",
	title: "Mint, Lime, and a Clean Finish",
	description:
	 "White rum, pressed lime, fresh mint, and a bright soda lift make this the house classic: crisp, aromatic, and built for slow summer nights.",
 },
 {
	id: 2,
	name: "Raspberry Mojito",
	image: "/images/drink2.png",
	title: "Berry Bright, Still Refreshing",
	description:
	 "Raspberries are muddled with mint and lime for a juicy, jewel-toned pour that keeps the mojito's sparkle while adding a soft berry edge.",
 },
 {
	id: 3,
	name: "Violet Breeze",
	image: "/images/drink3.png",
	title: "Floral, Cool, and Silky",
	description:
	 "A layered blend of citrus, violet, mint, and crushed ice creates a smooth, floral cocktail with a clean finish and a striking color.",
 },
 {
	id: 4,
	name: "Curacao Mojito",
	image: "/images/drink4.png",
	title: "Crafted With Care, Poured With Love",
	description:
	 "Blue curacao, lime, mint, and rum come together for a tropical mojito with a citrus-forward profile and a luminous seaside hue.",
 },
];

export {
 navLinks,
 cocktailLists,
 mockTailLists,
 featureLists,
 goodLists,
 openingHours,
 barPhone,
 barEmail,
 barAddress,
 socials,
 allCocktails,
};
