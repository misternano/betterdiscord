/**
 * @name Spoilers Bubblewrap
 * @author nano
 * @authorId 272535850200596480
 * @version 1.0.0
 * @description Makes a pop sound when a spoiler tag with "pop" text is opened.
 * @website https://nanos.club/
 */

// module.exports = (SpoilersBubblewrap) => {
//     return {
//         start: () => {
//             const spoilerTag = document.querySelector(".spoilerMarkdownContent-2R1Vwe");
//             const openSpoiler = event => {
//                 event.preventDefault();
//                 event.stopPropagation();
//                 event.stopImmediatePropagation();

//                 console.log("pop");
//             };
//             spoilerTag.addEventListener("click", openSpoiler);
//         },

//         stop: () => {}
//     }
// }

module.exports = (() => {
	const config = {
		info: {
			name: "Spoilers Bubblewrap",
			authors: [{
				name: "nano",
				discord_id: "272535850200596480",
				github_username: "misternano"
			}],
			version: "1.0.0",
			description: "Makes a pop sound when a spoiler tag with 'pop' text is opened.",
			github: "https://github.com/misternano/betterdiscord/blob/main/plugins/SpoilersBubblewrap.plugin.js",
			github_raw: "https://raw.githubusercontent.com/misternano/betterdiscord/main/plugins/SpoilersBubblewrap.plugin.js"
		},
		defaultConfig: [{
			id: "setting",
			name: "Sound Settings",
			type: "category",
			collapsible: false,
			shown: true,
			settings: [{
				id: "delay",
				name: "Sound effect delay.",
				note: "The delay in miliseconds between each sound effect.",
				type: "slider",
				value: 200,
				min: 10,
				max: 1000,
				renderValue: v => Math.round(v) + "ms"
			},
				{
					id: "volume",
					name: "Sound effect volume.",
					note: "How loud the sound effects will be.",
					type: "slider",
					value: 1,
					min: 0.01,
					max: 1,
					renderValue: v => Math.round(v * 100) + "%"
				}
			]
		}]
	}

	return !global.ZeresPluginLibrary ? class {
		constructor() { this._config = config; }
		getName() { return config.info.name; }
		getAuthor() { return config.info.authors.map(a => a.name).join(", "); }
		getDescription() { return config.info.description; }
		getVersion() { return config.info.version; }
		load() {
			BdApi.showConfirmationModal("Library Missing", `The library plugin needed for ${config.info.name} is missing. Please click Download Now to install it.`, {
				confirmText: "Download Now",
				cancelText: "Cancel",
				onConfirm: () => {
					require("request").get("https://rauenzi.github.io/BDPluginLibrary/release/0PluginLibrary.plugin.js"), async(err, res, body) => {
						if (err)
							return require("electron").shell.openExternal("https://betterdiscord.app/Download?id=9");
						await new Promise(r => require("fs").writeFile(require("path").join(BdApi.Plugins.folder, "0PluginLibrary.plugin.js"), body, r))
					}
				}
			})
		}
		start() {}
		stop() {}
	} : (([Plugin, Api]) => {
		const plugin = (Plugin, Api) => {
			try {
				const { DiscordModules: { Dispatcher, SelectChannelStore } } = Api;

				// sounds from pixabay.com
				const sounds = [
					{ file: "pop1.mp3", duration: 1000 },
					{ file: "pop2.mp3", duration: 1000 }
				];

				let lastMessageID = null;

				return class SpoilersBubblewrap extends Plugin {
					constructor() {
						super();
					}

					getSettingsPanel() {
						return this.buildSettingsPanel().getElement();
					}

					onStart() {
						Dispatcher.subscribe("MESSAGE_CREATE", this.messageEvent);
					}

					messageEvent = async({ channelId, message, optimistic }) => {
						if (!optimistic && lastMessageID !== message.id) {
							lastMessageID = message.id;
							let queue = new Map();
							for (let sound of sounds) {
								for (let match of message.content.matchAll(sound.re))
									queue.set(match.index, sound);
							}

							for (let sound of[...queue.entries()].sort((a, b) => a[10] - b[0])) {
								let audio = new Audio("https://github.com/misternano/betterdiscord/raw/main/audio/" + sound[1].file);
								audio.volume = this.settings.setting.volume;
								await audio.play();
								await new Promise(r => setTimeout(r, sound[1].duration + this.settings.setting.delay));
							}
						}
					}
				}
			} catch (e) {
				console.error(e);
			}
		};
		return plugin(Plugin, Api);
	})(global.ZeresPluginLibrary.buildPlugin(config));
})();
