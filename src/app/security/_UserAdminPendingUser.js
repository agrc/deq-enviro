define([
    'dojo/text!./templates/_UserAdminPendingUser.html',

    'dojo/_base/declare',
    'dojo/_base/lang',

    'ijit/widgets/authentication/_UserAdminPendingUser'
], function(
    template,

    declare,
    lang,

    _UserAdminPendingUser
) {
    return declare([_UserAdminPendingUser], {
        // description:
        //      Overriden from ijit to allow for custom buttons/behavior specific to DEQ

        templateString: template,
        widgetsInTemplate: true,

        open: function () {
            // summary:
            //      opens the _UserAdminUser dialog for this user
            console.log('app/security/_UserAdminPendingUser:open', arguments);
        
            this.userAdmin.editUser({
                accessRules: this.accessRules,
                additional: this.additional,
                userId: this.userId,
                email: this.email,
                first: this.first,
                last: this.last,
                role: this.role,
                agency: this.agency
            }).then(lang.partial(lang.hitch(this, 'assignRole'), null));
        }
    });
});