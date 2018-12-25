export default async ({ ctx }) => {
    if (__DEV__) {
        console.log('server lifecycle: onRenderBeforeDataToStore')
    }
    if (/^\/delayed(\/|$)/.test(ctx.path)) {
        await new Promise(resolve => 
            setTimeout(resolve, 1000)
        )
    }
    // if (__DEV__) console.log(o)
}
