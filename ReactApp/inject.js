const ejs = require('ejs')

const DEFAULT_TEMPLATE = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <script>//inject_meta</script>
        <title><script>//inject_title</script></title>
        <script>//inject_component_styles</script>
    </head>
    <body>
        <div id="root">
            <div><script>//inject_html</script></div>
        </div>
        <script>//inject_redux_state</script>
        <script>//inject_js</script>
    </body>
    </html>
`

export default (template = DEFAULT_TEMPLATE, inject = {}) => {
    // let html = template
    // for (let key in inject) {
    //     html = html.replace(`<script>//inject_${key}</script>`, inject[key])
    // }
    try {
        for (let key in inject) {
            if (typeof inject[key] === 'function')
                inject[key] = inject[key](template)
        }
    } catch (e) {
        console.log(e)
    }
    // console.log(inject)
    return ejs.render(
        template, {
            inject,
        }, {}
    )
}
