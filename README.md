# Jarbas

### Jarbas is a voice powered (Portuguese) shopping assistant built for the 48h hackaton of Pixels Camp 2016. The project got 3rd place.

Ever been in a situation where you notice that you're missing something in your house, you need to buy it but then forget to add that product to your shopping list? Well now with Jarbas, you don't need to open your note app to write down your shopping list. Simply say "Jarbas" to your phone (Android) or using the Jarbas Webapp (Chrome only) and let it help you note your shopping list. Jarbas will be listening to what you want to find and save the list for you. Once you're done, you can ask him to email you the list or request for the groceries to be delivered at your place (using Continente's API). Never forget that toilet paper anymore! Jarbas is here for you!

![Gif Demo](https://github.com/mstrlaw/jarbas/blob/master/public/jarbas_gif.gif?raw=true)

* The bot works by being constantly listening to the user's input using Chrome Browser;
* After the final transcript is returned from Google's API, it attempts to match commands with a dictionary of possible commands by stripping stop words and other words that may not matter. Match is done using a very dumb regex;
* If products are found and returned, the bot waits for the user to state which product he wishes to add to his shopping list. Product similarity is calculated using [Sørensen–Dice's Coefficient](https://en.wikipedia.org/wiki/S%C3%B8rensen%E2%80%93Dice_coefficient);
* Once the user is done with his purchase, he asks for the list to be finalized; The list can be then sent to the user's email if he asks for it;
* Previously bought products can be found on the user's main page, including some stats like the most bough product and purchase mean cost;
* Products were provided by Continente through their API. To speed up matching, products were stored on the Mongo database so the bot isn't constantly using the API to retrieve products;
* The team also built an Android app that loads the webapp on a webframe in order to use Android's native speech to text API; The native app and webapp talked to each other using Android [Javascript Interface](https://developer.android.com/guide/webapps/webview.html#BindingJavaScript)


**Stack:**
* [Meteor](https://www.meteor.com/) for infrastructure
* [Google WebSpeech API](https://dvcs.w3.org/hg/speech-api/raw-file/tip/speechapi.html) (Only works in Chrome)
* [Bootstrap](http://getbootstrap.com/)
* [Continente](https://www.continente.pt)'s products API (made specifically for the contest)
