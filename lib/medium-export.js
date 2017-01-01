'use babel';

import MediumExportView from './medium-export-view';
import {CompositeDisposable} from 'atom';

export default {

    mediumExportView: null,
    modalPanel: null,
    subscriptions: null,
    config: {
        accessToken: {
            type: 'string',
            default: ''
        }
    },

    activate(state) {
        this.mediumExportView = new MediumExportView(state.mediumExportViewState);
        this.modalPanel = atom.workspace.addModalPanel({
            item: this.mediumExportView.getElement(),
            visible: false
        });

        // Events subscribed to in atom's system can be easily cleaned up with a CompositeDisposable
        this.subscriptions = new CompositeDisposable();

        // Register command that toggles this view
        this.subscriptions.add(atom.commands.add('atom-workspace', {
                'medium-export:export': () => this.export(),
    }));

        medium = require('medium-sdk');
        client = new medium.MediumClient({
            clientId: '546263a99e36',
            clientSecret: '38ab45b876c93ed6ff2faa63c33ddd43ec51240a'
        });

        client.setAccessToken(atom.config.get('medium-export.accessToken'));

        if (editor = atom.workspace.getActiveTextEditor()) {
            currentText = editor.getText();
            postTitle = editor.getTextInBufferRange([[0, 2], [0, 100]]);
            postTitle.replace(/^\s+|\s+$/g, "");

            client.getUser(function (err, user) {
                client.createPost({
                    userId: user.id,
                    title: postTitle,
                    contentFormat: medium.PostContentFormat.MARKDOWN,
                    content: currentText,
                    publishStatus: medium.PostPublishStatus.DRAFT
                }, function (err, post) {
                    console.log(err, user, post)
                })
            });


        }

    },

    deactivate() {
        this.modalPanel.destroy();
        this.subscriptions.dispose();
        this.mediumExportView.destroy();
    },

    serialize() {
        return {
            mediumExportViewState: this.mediumExportView.serialize()
        };
    },

    export() {
        return (
            this.modalPanel.isVisible() ?
                this.modalPanel.hide() :
                this.modalPanel.show()
        );
    }

};
