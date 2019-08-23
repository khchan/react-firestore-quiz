import React from 'react';
import '../styles/Buttons.css';
import '../styles/CharacterSelect.css';
import '../styles/Grid.css';
import CharacterCard from './CharacterCard.js';
import { MakeUnique, IsAnonymous, Profiles, SELECTED_PROFILE_LS_KEY } from '../constants/Profiles.js';

class CharacterSelect extends React.Component {

    constructor(props) {
        super(props);
        const existingProfile = JSON.parse(localStorage.getItem(SELECTED_PROFILE_LS_KEY) || null);
        this.state = {
            selectedProfile: existingProfile,
            profiles: existingProfile ? [existingProfile] : Profiles
        };
    }

    isCharacterSelected(profile) {
        if (!this.state.selectedProfile) {
            return false;
        }

        const sameId = this.state.selectedProfile.id === profile.id;
        const bothAnonymous = IsAnonymous(this.state.selectedProfile) && IsAnonymous(profile);
        return sameId || bothAnonymous;
    }

    toggleCharacterSelect(profile) {
        if (this.isCharacterSelected(profile)) {
            this.setState({ selectedProfile: null, profiles: Profiles });
            localStorage.removeItem(SELECTED_PROFILE_LS_KEY);
        } else {
            let uniqueProfile = MakeUnique(profile);
            this.setState({ selectedProfile: profile, profiles: [uniqueProfile] });
            localStorage.setItem(SELECTED_PROFILE_LS_KEY, JSON.stringify(uniqueProfile));
        }
    }

    filterProfiles = (event) => {
        let searchValue = event.target.value.toLowerCase().replace(/\s/g, "");        ;
        let filtered = Profiles.filter(profile => {
            const fullName = profile.firstName.toLowerCase() + profile.lastName.toLowerCase();
            return fullName.indexOf(searchValue.trim().toLowerCase()) !== -1;
        });

        this.setState({ profiles: filtered });
    }

    mapProfileToCard(state, profile) {
        const profileName = `${profile.firstName}-${profile.lastName}`;
        const profileSelected = this.isCharacterSelected(profile) ? 'profile-img card-img-pulsate' : 'profile-img';
        const nameOrReadyText = this.isCharacterSelected(profile) ? 
            <h2 className='selected-profile-name'>Waiting for other players...</h2> : <span>{profile.firstName} {profile.lastName}</span>;

        return (
            <div className="grid-item" key={profileName} onClick={() => this.toggleCharacterSelect(profile)}>
                <div className='grid-item-container'>
                    <CharacterCard cardClass={profileSelected} profileImg={profile.img} cardText={nameOrReadyText}></CharacterCard>
                </div>
            </div>
        );
    }

    render() {
        const selectedProfile = this.state.selectedProfile;
        const profileFullName = selectedProfile ? `${selectedProfile.firstName} ${selectedProfile.lastName}` : 'Choose your character';

        return (
            <div className='character-select-container'>
                <h1>{profileFullName}</h1>
                <input id='search' type='text' className={selectedProfile ? 'hide' : ''}
                       placeholder='Search...' onChange={this.filterProfiles} />
                <div className="grid-row">
                    {this.state.profiles.map(profile => this.mapProfileToCard(this.state, profile))}
                </div>
            </div>
        );
    }
}

export default CharacterSelect;
