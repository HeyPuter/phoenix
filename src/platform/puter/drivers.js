export const CreateDriversProvider = ({
    puterSDK
}) => {
    return {
        call: async (params) => {
            console.log('the puterSDK', puterSDK);
            const resp = await fetch(
                `${puterSDK.APIOrigin}/drivers/call`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${puterSDK.authToken}`
                    },
                    body: JSON.stringify({
                        ...params,
                    }),
                }
            );
    
            return await resp.blob();
        },
        usage: async () => {
            const resp = await fetch(
                `${puterSDK.APIOrigin}/drivers/usage`,
                {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${puterSDK.authToken}`
                    },
                }
            );

            return await resp.json();                        
        }
    }
};
