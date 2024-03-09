<template>
    <v-container>
        <v-responsive class="align-center fill-height">
            <v-sheet class="mx-auto text-left" max-width="500">
                <v-container>
                    <a target="_blank" href="https://backstage.forgerock.com/docs/ds/7.4/rest-guide/preface.html">
                        <v-btn class="text-h5" variant="text" prepend-icon="mdi-sitemap-outline"> HDAP </v-btn>
                    </a>
                </v-container>

                <v-container>
                    <blockquote class="text-body">
                        <span class="font-weight-bold">H</span>TTP
                        <span class="font-weight-bold">D</span>irectory
                        <span class="font-weight-bold">A</span>ccess
                        <span class="font-weight-bold">P</span>rotocol
                        APIs provide REST-based access to ForgeRock Directory Services.
                        HDAP maps LDAP operations to HTTP and entries to JSON resources.
                    </blockquote>
                </v-container>

                <v-container>
                    <blockquote class="text-body">
                        If you know how to use LDAP and HTTP, you know most of what you need to know to build HDAP
                        applications. This JavaScript application shows some of HDAP's features.
                    </blockquote>
                </v-container>

                <v-list>
                    <v-list-subheader><span class="text-h5">Features</span></v-list-subheader>
                    <v-list-item prepend-icon="mdi-checkbox-marked-outline" title="Authentication"></v-list-item>
                    <v-list-item prepend-icon="mdi-checkbox-marked-outline" title="Basic search"></v-list-item>
                    <v-list-item prepend-icon="mdi-checkbox-marked-outline" title="Read entry"></v-list-item>
                    <v-list-item prepend-icon="mdi-checkbox-blank-outline" title="Tree browser"></v-list-item>
                    <v-list-item prepend-icon="mdi-checkbox-blank-outline" title="Advanced details view"></v-list-item>
                    <v-list-item prepend-icon="mdi-checkbox-blank-outline"
                        title="CRUD on any object class"></v-list-item>
                    <v-list-item prepend-icon="mdi-checkbox-blank-outline" title="Generic error handling"></v-list-item>
                    <v-list-item prepend-icon="mdi-checkbox-blank-outline" title="Profile page"></v-list-item>
                    <v-list-item prepend-icon="mdi-checkbox-blank-outline" title="NameFinder"></v-list-item>
                    <v-list-item prepend-icon="mdi-checkbox-blank-outline"
                        title="Account mgmt (lock, unlock, etc.)"></v-list-item>
                    <v-list-item prepend-icon="mdi-checkbox-blank-outline" title="Advanced search"></v-list-item>
                    <v-list-item prepend-icon="mdi-checkbox-blank-outline" title="Password policy mgmt"></v-list-item>
                </v-list>
            </v-sheet>
        </v-responsive>
    </v-container>
</template>

<script setup>
//
</script>