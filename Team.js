import Member from './Member.js';

class Team {
    constructor(name, teamContainerId) {
        this.name = name;
        this.members = [];
        this.teamContainer = document.getElementById(teamContainerId);

    }
     getFirstAliveMember(){
        // Implement logic to choose a target from the opposite team
        const aliveMembers = this.members.filter(member => member.currentHealth > 0);

        if (aliveMembers.length > 0) {
            return aliveMembers[0];
        }
    }

    addMembers (members)
   {
   this.members = members.map((member, index) => {
                              member.memberId = `${this.name.toLowerCase()}-member${index}`;
                              return member;
                          });
}
}

export default Team;
