/**
 * @name Spoilers Pop Sound
 * @author nanos.club
 * @authorId 272535850200596480
 * @version 1.0.0
 * @description Makes a pop sound when a spoiler tag with "pop" text is opened.
 * @website https://nanos.club/
 */

module.exports = (() => {
    const config = {
        info: {
            name: "Spoiler Pop Sound",
            version: "1.0.0",
            description: "Plays an audio file when a spoiler tag with the text 'pop' is opened.",
            authors: [{ name: "nanos.club" }],
            github: "https://github.com/misternano/betterdiscord",
            github_raw: "https://raw.githubusercontent.com/misternano/betterdiscord/master/plugin/SpoilerBubblewrap.plugin.js"
        },
        defaultConfig: [{
            id: "audioFileUrl",
            name: "Audio File URL",
            type: "textbox",
            value: "https://github.com/misternano/betterdiscord/tree/master/audio/pop.mp3",
            note: "The URL or path to the audio file to be played."
        }]
    };

    return !global.ZeresPluginLibrary ? class {
        constructor() {
            this._config = config;
        }

        getName() {
            return config.info.name;
        }

        getAuthor() {
            return config.info.authors.map(author => author.name).join(", ");
        }

        getDescription() {
            return config.info.description;
        }

        getVersion() {
            return config.info.version;
        }

        load() {
            BdApi.showConfirmationModal(
                "Library Missing",
                `The library plugin needed for ${config.info.name} is missing. Please click Download Now to install it.`,
                {
                    confirmText: "Download Now",
                    cancelText: "Cancel",
                    onConfirm: () => {
                        require("request").get("https://rauenzi.github.io/BDPluginLibrary/release/0PluginLibrary.plugin.js", async (err, res, body) => {
                            if (err) {
                                return require("electron").shell.openExternal("https://betterdiscord.app/Download?id=9");
                            }
                            await new Promise(r =>
                                require("fs").writeFile(
                                    require("path").join(BdApi.Plugins.folder, "0PluginLibrary.plugin.js"),
                                    body,
                                    r
                                )
                            );
                        });
                    }
                }
            );
        }

        start() { }

        stop() { }
    } : (([Plugin, Api]) => {
        const plugin = (Plugin, Api) => {
            const { WebpackModules, DiscordModules } = Api;
            const { React } = DiscordModules;
            const SpoilerModule = WebpackModules.find(m => m.default && m.default.displayName === "Spoiler");
            const { SpoilerText } = SpoilerModule.default;

            return class SpoilerPopSound extends Plugin {
                constructor() {
                    super();
                }

                onStart() {
                    const audioFileUrl = this.settings.audioFileUrl || "https://github.com/misternano/betterdiscord/tree/master/audio/pop.mp3";
                    const audio = new Audio(audioFileUrl);

                    const observer = new MutationObserver(mutationsList => {
                        for (const mutation of mutationsList) {
                            if (mutation.type === "childList" && mutation.addedNodes.length) {
                                const spoilers = mutation.target.getElementsByClassName(SpoilerText);
                                for (const spoiler of spoilers) {
                                    if (spoiler.textContent.toLowerCase().includes("pop")) {
                                        audio.currentTime = 0;
                                        audio.play();
                                        break;
                                    }
                                }
                            }
                        }
                    });

                    const chatContainer = document.querySelector(".message-2CShn3");
                    if (chatContainer) {
                        observer.observe(chatContainer, { childList: true, subtree: true });
                    }
                }

                onStop() {
                    const chatContainer = document.querySelector(".message-2CShn3");
                    if (chatContainer) {
                        observer.disconnect();
                    }
                }
            };
        };

        return plugin(Plugin, Api);
    })(global.ZeresPluginLibrary.buildPlugin(config));
})();