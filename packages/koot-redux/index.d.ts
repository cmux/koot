declare module 'redux' {
    interface Dispatch {
        <ActionWithoutType, R>(
            actionType: string,
            payload?: ActionWithoutType
        ): Promise<R>;
    }
}
