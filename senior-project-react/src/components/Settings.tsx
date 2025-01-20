namespace SettingsPage {
    export interface User {
        id: number;
        fname: string;
        lname: string;
        profile_picture: string;
        colonial_floor: string
        colonial_side: string;
    }
}

async function loadUser() {
    // TODO: Implement this function
    // const response = await fetch()
}

const Settings = () => {
    return <h1>Settings Page</h1>;
}

export default Settings;
