import {Pho} from "../src"


describe('Category Array Tests', function () {
    test('should parse an array with a given schema', function () {
        const pho = new Pho()

        pho.field('name', 'string', 'Your name')
        pho.field('age', 'number', 'Your age', 30)
        pho.categoryArray('hobbies', 'Your hobbies', (hobbies) => {
            hobbies.field('name', 'string', 'Hobby name').required().oneOf('dancing', 'running', 'fishing')
            hobbies.field('type', 'string', 'Hobby type', 'light')
        })

        const test = {
            name: 'anton',
            hobbies: [{name: 'running', type: 'physical'}, {name: 'dancing', type: 'physical'}, {name: 'fishing'}],
        }
        const expected = {
            name: 'anton',
            age: 30,
            hobbies: [{name: 'running', type: 'physical'}, {name: 'dancing', type: 'physical'}, {
                name: 'fishing',
                type: 'light'
            }],
        }
        expect(pho.parse(test)).toStrictEqual(expected)
    })


    test.each([
        { hobbies: [1, 2, 3] },
        { hobbies: [{name: 1}] },
        { hobbies: [{name: 'dancing'}, 2] },
        { hobbies: [{name: 'Joe'}] },
        { hobbies: [{name: 'dancing'}, {name: 'running'}, {name: 'running', type: 2}] },
    ])('validation failed when category does not follow the schema', function (test) {
        const pho = new Pho()

        pho.categoryArray('hobbies', 'Your hobbies', (hobbies) => {
            hobbies.field('name', 'string', 'Hobby name').required().oneOf('dancing', 'running', 'fishing')
            hobbies.field('type', 'string', 'Hobby type', 'light')
        })

        expect(() => {
            pho.parse(test)
        }).toThrow()
    })
})