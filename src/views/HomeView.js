import * as Phoenix from "../phoenix";

export default class HomeView extends Phoenix.View {
	handleEvent(event, payload) {
		switch (event) {
			case "login":
				return this.login(payload);
		}
	}

	login({ username, password }) {
		console.log(username, password);
		return {};
	}
}
