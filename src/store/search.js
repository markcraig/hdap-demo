import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useSearchStore = defineStore('searchStore', () => {
    const advancedSearchBase = ref('')
    const advancedSearchQueryFilter = ref('true')
    const advancedSearchScope = ref('one')
    const advancedSearchCountOnly = ref(false)
    const advancedSearchOperationalFields = ref(false)
    const advancedSearchResults = ref('')
    const basicSearchTerms = ref('')
    const basicSearchResults = ref('')
    const tab = ref('basic')

    function $reset() {
        advancedSearchBase.value = ''
        advancedSearchQueryFilter.value = 'true'
        advancedSearchScope.value = 'one'
        advancedSearchCountOnly.value = false
        advancedSearchOperationalFields.value = false
        advancedSearchResults.value = ''
        basicSearchTerms.value = ''
        basicSearchResults.value = ''
        tab.value = 'basic'
    }

    return {
        advancedSearchBase,
        advancedSearchCountOnly,
        advancedSearchOperationalFields,
        advancedSearchQueryFilter,
        advancedSearchResults,
        advancedSearchScope,
        basicSearchResults,
        basicSearchTerms,
        $reset,
        tab
    }
})
