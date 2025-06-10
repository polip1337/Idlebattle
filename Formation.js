// Formation.js - Manages the battle grid and character positions
export class Formation {
    constructor() {
        // Initialize 4x4 grid (2x4 for each team)
        this.grid = Array(4).fill(null).map(() => Array(4).fill(null));
        this.team1 = null;
        this.team2 = null;
    }

    initializeTeams(team1, team2) {
        this.team1 = team1;
        this.team2 = team2;
        this.placeTeam(team1, true);  // true for team1 (left side)
        this.placeTeam(team2, false); // false for team2 (right side)
    }

    placeTeam(team, isTeam1) {
        const startCol = isTeam1 ? 0 : 2;
        const members = team.members;
        const hero = members.find(member => member.constructor.name === 'Hero');
        
        if (hero) {
            // Use hero's partyFormation for team1
            const partyFormation = hero.partyFormation;
            
            // Place members according to partyFormation
            for (let row = 0; row < partyFormation.length; row++) {
                for (let col = 0; col < partyFormation[row].length; col++) {
                    const member = partyFormation[row][col];
                    if (member) {
                        // Map party formation position to battle grid
                        // partyFormation is 2x4, battle grid is 4x4
                        // We need to map row 0,1 to rows 0,1 and keep columns 0-3
                        this.grid[row][startCol + col] = member;
                    }
                }
            }
        } else {
            this.placeTeamDefault(members, startCol);
        }
        
    }

    placeTeamDefault(members, startCol) {
        // Place front row (row 1)
        for (let i = 0; i < Math.min(4, members.length); i++) {
            const member = members[i];
            if (member.position === "Front") {
                this.grid[1][startCol + i] = member;
            }
        }

        // Place back row (row 0)
        for (let i = 0; i < Math.min(4, members.length); i++) {
            const member = members[i];
            if (member.position === "Back") {
                this.grid[0][startCol + i] = member;
            }
        }
    }

    getCharacterPosition(character) {
        for (let row = 0; row < 4; row++) {
            for (let col = 0; col < 4; col++) {
                if (this.grid[row][col] === character) {
                    return { row, col };
                }
            }
        }
        return null;
    }

    getAdjacentCharacters(character) {
        const pos = this.getCharacterPosition(character);
        if (!pos) return [];

        const adjacent = [];
        const directions = [
            { row: -1, col: 0 },  // up
            { row: 1, col: 0 },   // down
            { row: 0, col: -1 },  // left
            { row: 0, col: 1 },   // right
            { row: -1, col: -1 }, // up-left
            { row: -1, col: 1 },  // up-right
            { row: 1, col: -1 },  // down-left
            { row: 1, col: 1 }    // down-right
        ];

        for (const dir of directions) {
            const newRow = pos.row + dir.row;
            const newCol = pos.col + dir.col;

            // Check if position is within grid bounds
            if (newRow >= 0 && newRow < 4 && newCol >= 0 && newCol < 4) {
                const target = this.grid[newRow][newCol];
                if (target) {
                    adjacent.push(target);
                }
            }
        }

        return adjacent;
    }

    getAllCharacters() {
        const characters = [];
        for (let row = 0; row < 4; row++) {
            for (let col = 0; col < 4; col++) {
                if (this.grid[row][col]) {
                    characters.push(this.grid[row][col]);
                }
            }
        }
        return characters;
    }

    getRowMembers(row) {
        return this.grid[row].filter(member => member !== null);
    }

    getColumnMembers(col) {
        return this.grid.map(row => row[col]).filter(member => member !== null);
    }

    moveCharacter(character, newRow, newCol) {
        const oldPos = this.getCharacterPosition(character);
        if (oldPos) {
            this.grid[oldPos.row][oldPos.col] = null;
        }
        this.grid[newRow][newCol] = character;
    }

    removeCharacter(character) {
        const pos = this.getCharacterPosition(character);
        if (pos) {
            this.grid[pos.row][pos.col] = null;
        }
    }

    getTeamArea(isTeam1) {
        const startCol = isTeam1 ? 0 : 2;
        const area = [];
        for (let row = 0; row < 2; row++) {
            for (let col = startCol; col < startCol + 2; col++) {
                if (this.grid[row][col]) {
                    area.push(this.grid[row][col]);
                }
            }
        }
        return area;
    }

    getDiagonalCharacters(character) {
        const pos = this.getCharacterPosition(character);
        if (!pos) return [];

        const diagonals = [
            { row: pos.row - 1, col: pos.col - 1 }, // up-left
            { row: pos.row - 1, col: pos.col + 1 }, // up-right
            { row: pos.row + 1, col: pos.col - 1 }, // down-left
            { row: pos.row + 1, col: pos.col + 1 }  // down-right
        ];

        const diagonalCharacters = [];
        diagonals.forEach(dir => {
            if (dir.row >= 0 && dir.row < 4 && dir.col >= 0 && dir.col < 4) {
                const target = this.grid[dir.row][dir.col];
                if (target) {
                    diagonalCharacters.push(target);
                }
            }
        });

        return diagonalCharacters;
    }
} 