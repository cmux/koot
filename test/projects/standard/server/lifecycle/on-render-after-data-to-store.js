export default async ({ ctx }) => {
    if (__DEV__) {
        console.log('server lifecycle: onRenderAfterDataToStore')
        if (/^\/delayed(\/|$)/.test(ctx.path)) {
            await new Promise(resolve =>
                setTimeout(resolve, 1500)
            )
        }
    }
    // if (__DEV__) console.log(o)
}
