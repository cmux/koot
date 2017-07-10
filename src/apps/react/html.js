export const template = `
    <!DOCTYPE html>
    <html>
    <head>
        <title><script>//inject_title</script></title>

        <base target="_self">
        <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
        <meta charset="UTF-8">

    </head>
    <body>
        <div id="root">
            <div><script>//inject_react</script></div>
        </div>
        <script>//inject_redux</script>
    </body>
    </html>
`