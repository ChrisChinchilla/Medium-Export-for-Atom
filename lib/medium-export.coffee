MediumExportView = require './medium-export-view'
{CompositeDisposable} = require 'atom'

module.exports = MediumExport =
  mediumExportView: null
  modalPanel: null
  subscriptions: null
  config:
    accessToken:
      type: 'string'
      default: ''
#  client: null

  activate: (state) ->
    @mediumExportView = new MediumExportView(state.mediumExportViewState)
    @modalPanel = atom.workspace.addModalPanel(item: @mediumExportView.getElement(), visible: false)

    # Events subscribed to in atom's system can be easily cleaned up with a CompositeDisposable
    @subscriptions = new CompositeDisposable

    # Register command that toggles this view
    @subscriptions.add atom.commands.add 'atom-workspace', 'medium-export:export': => @export()

    # TODO: Get from settings
    medium = require 'medium-sdk'
    client = new medium.MediumClient({
      clientId: '546263a99e36',
      clientSecret: '38ab45b876c93ed6ff2faa63c33ddd43ec51240a'
    })

    client.setAccessToken(atom.config.get('medium-export.accessToken'))

    if editor = atom.workspace.getActiveTextEditor()
      currentText = editor.getText()
      postTitle = editor.getTextInBufferRange([[0,2], [0,100]])
      postTitle.replace /^\s+|\s+$/g, ""

    client.getUser (err, user) ->
      client.createPost {
        userId: user.id
        title: postTitle
        contentFormat: medium.PostContentFormat.MARKDOWN
        content: currentText
        publishStatus: medium.PostPublishStatus.DRAFT
      }, (err, post) ->
        console.log err, user, post
        return
      return

  deactivate: ->
    @modalPanel.destroy()
    @subscriptions.dispose()
    @mediumExportView.destroy()
    # TODO: Destroy Client

  serialize: ->
    mediumExportViewState: @mediumExportView.serialize()

  export: ->
    if @modalPanel.isVisible()
      @modalPanel.hide()
    else
      @modalPanel.show()
