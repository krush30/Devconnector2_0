const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator')
const auth = require('../../middleware/auth')
const config = require('config')

const Profile = require('../../modal/Profile');
const User = require('../../modal/User');

//Get profile by token 
router.get('/me', auth, async (req, res) => {
    try {
        const profile = await Profile.findOne({
            // console.log(req.user.id)

            user: req.user.id
        }).populate('user', ['name', 'avatar'])

        if (!profile) {
            return res.status(400).json({
                msg:
                    "There is no profile for this user"
            })
        }
        res.json(profile)

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error')

    }
});

// Create a profile

router.post('/', [auth,
    check('status', 'status is required').not().isEmpty(),
    check('skills', 'skills are required').not().isEmpty()
], async (req, res) => {
    const error = validationResult(req);
    if (!error.isEmpty()) {
        return res.status(400).json({ error: error.array() })
    }

    const {
        company,
        website,
        location,
        bio,
        status,
        githubusername,
        skills,
        youtube,
        facebook,
        twitter,
        instagram,
        linkedin
    } = req.body
    // create a profile
    // Building a profile object
    const profileFields = {};
    profileFields.user = req.user.id;
    if (company) profileFields.company = company;
    if (website) profileFields.website = website;
    if (location) profileFields.location = location;
    if (bio) profileFields.bio = bio;
    if (status) profileFields.status = status;
    if (githubusername) profileFields.githubusername = githubusername;
    if (skills) profileFields.skills = skills.split(',').map(skill => skill.trim());
    console.log(profileFields.skills);

    // Build social obj
    profileFields.social = {};
    if (youtube) profileFields.social.youtube = youtube;
    if (facebook) profileFields.social.facebook = facebook;
    if (twitter) profileFields.social.twitter = twitter;
    if (instagram) profileFields.social.instagram = instagram;
    if (linkedin) profileFields.social.linkedin = linkedin;

    console.log(req.body);

    try {
        let profile = await Profile.findOne({
            user: req.user.id
        });
        if (profile) {
            profile = await Profile.findOneAndUpdate(
                { user: req.user.id },
                { $set: profileFields },
                { new: true }
            );
            return res.json(profile);
        }

        // If no profile exists, create a new one
        profile = new Profile(profileFields);
        await profile.save();
        res.json(profile);


    } catch (err) {
        console.error(err.message);
        res.status(500).send('server error')


    }


})
// Get all  profiles
router.get('/', async (req, res) => {
    try {
        const profiles = await Profile.find().populate('user', ['name', 'avatar'])
        res.json(profiles);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }

})

// Get profile by id
router.get('/user/:user_id', async (req, res) => {
    try {

        const profile = await Profile.find({ user: req.params.user_id }).populate('user', ['name', 'avatar']);
        if (!profile) {
            return res.status(400).json({ msg: 'Their no profile' })
        }
        res.json(profile)
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }

})

// DElete Profile
router.delete('/', auth, async (req, res) => {
    try {
        await Profile.findOneAndDelete({ user: req.user.id })
        await User.findOneAndDelete({ user: req.user.id })
        res.json({ msg: "User removed" })
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
})

// Add profile education
router.put('/education', [auth,
    check('school', 'school is required').not().isEmpty(),
    check('fieldofstudy', 'Field of study is required').not().isEmpty(),
    check('from', 'From date is required').not().isEmpty()
], async (req, res) => {
    const error = validationResult(req);
    if (!error.isEmpty()) {
        return res.status(400).json({ error: error.array() })
    }

    const {
        school,
        fieldofstudy,
        from,
        degree,
        to,
        current,
        description
    } = req.body

    const newEdu = {
        school,
        fieldofstudy,
        from,
        degree,
        to,
        current,
        description
    }

    try {
        const profile = await Profile.findOne({ user: req.user.id })
        profile.education.unshift(newEdu);

        await profile.save();
        res.json(profile);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error')
    }
})

module.exports = router;