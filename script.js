// Configuración de MSAL
const msalConfig = {
    auth: {
        clientId: "TU_CLIENT_ID_DE_AZURE_AD",
        authority: "https://login.microsoftonline.com/common",
        redirectUri: window.location.href
    }
};

const msalInstance = new msal.PublicClientApplication(msalConfig);

document.getElementById("login-btn").addEventListener("click", login);

async function login() {
    try {
        const loginResponse = await msalInstance.loginPopup({
            scopes: ["User.Read", "Calendars.ReadWrite", "Mail.Send"]
        });

        console.log("Inicio de sesión exitoso:", loginResponse);
        document.getElementById("reservation-form").style.display = "block";
        document.getElementById("login-btn").style.display = "none";
    } catch (error) {
        console.error("Error al iniciar sesión:", error);
    }
}

document.getElementById("reserve-btn").addEventListener("click", async () => {
    const date = document.getElementById("date").value;
    const time = document.getElementById("time").value;
    const eventStart = new Date(${date}T${time}:00).toISOString();

    const eventDetails = {
        subject: "Reserva de Espacio",
        start: { dateTime: eventStart, timeZone: "UTC" },
        end: { dateTime: new Date(new Date(eventStart).getTime() + 3600000).toISOString(), timeZone: "UTC" },
        attendees: [{ emailAddress: { address: "invitado@example.com", name: "Invitado" } }],
        location: { displayName: "Sala de reuniones" }
    };

    try {
        await msalInstance.acquireTokenSilent({
            scopes: ["Calendars.ReadWrite"]
        }).then(async tokenResponse => {
            const accessToken = tokenResponse.accessToken;
            await fetch("https://graph.microsoft.com/v1.0/me/events", {
                method: "POST",
                headers: {
                    "Authorization": Bearer ${accessToken},
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(eventDetails)
            });

            alert("Reserva realizada y evento añadido al calendario.");
        });
    } catch (error) {
        console.error("Error al crear el evento:", error);
    }
});
